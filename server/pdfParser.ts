import { PDFParse } from 'pdf-parse';
import { Opportunity } from '../src/types';

export interface ExtractedPdfContent {
  text: string;
  pages: number;
  tables?: any[];
}

/**
 * Extracts plain text, tables, and hyperlinks from a PDF buffer.
 */
export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<ExtractedPdfContent> {
  let parser: PDFParse | null = null;
  try {
    parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    const totalPages = textResult.total || textResult.pages?.length || 1;
    const fullText = textResult.text || '';
    
    let tables: any[] = [];
    try {
      const tableResult = await parser.getTable();
      tables = tableResult?.mergedTables || tableResult?.pages?.flatMap(p => p.tables) || [];
    } catch {
      // Table detection is optional
    }

    return {
      text: fullText,
      pages: totalPages,
      tables,
    };
  } catch (err: any) {
    console.error('Error extracting text with PDFParse:', err);
    throw new Error(`Failed to parse PDF: ${err.message || 'Invalid PDF file'}`);
  } finally {
    if (parser) {
      try {
        await parser.destroy();
      } catch {
        // Ignore destroy error
      }
    }
  }
}

/**
 * Standardizes deadline date to YYYY-MM-DD
 */
export function normalizeDate(dateStr: string): string {
  if (!dateStr) return '2026-10-15';
  
  // Clean string
  const clean = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;

  const months: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
    january: '01', february: '02', march: '03', april: '04', june: '06',
    july: '07', august: '08', september: '09', october: '10', november: '11', december: '12'
  };

  // e.g. "15 Sep 2026" or "30 Sep 2026, 11:45 PM PT" or "1 Oct 2026"
  const match = clean.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const monthKey = match[2].toLowerCase();
    const month = months[monthKey] || months[monthKey.slice(0, 3)] || '10';
    const year = match[3];
    return `${year}-${month}-${day}`;
  }

  return '2026-10-15';
}

/**
 * Intelligent regex / table heuristic fallback parser to extract opportunities
 * from PDF text or pasted link tables when Gemini is unavailable or rate-limited.
 */
export function parseOpportunitiesFallback(text: string, defaultSource: string = 'PDF Text Heuristic Parser'): Partial<Opportunity>[] {
  const opportunities: Partial<Opportunity>[] = [];
  if (!text || !text.trim()) return opportunities;

  const urlRegex = /(https?:\/\/[^\s"'<>\)]+)/g;
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const urls = line.match(urlRegex) || [];

    if (urls.length > 0) {
      const url = urls[0].replace(/[\.,]$/, '');
      const parts = line.split(/\t|\s{3,}|\s\|\s/);

      let name = '';
      let org = 'Organizer';
      let mode: 'online' | 'offline' | 'hybrid' = 'online';
      let prizePool = '';
      let deadline = '2026-10-15';
      let domains: string[] = ['AI/ML', 'Software Development'];
      let eligibility = 'Open to all students';
      let description = '';

      if (parts.length >= 3) {
        name = parts[0].trim();
        org = parts[1]?.trim() || 'Organizer';
        
        for (const p of parts) {
          const lower = p.toLowerCase();
          if (lower.includes('hybrid')) mode = 'hybrid';
          else if (lower.includes('offline') || lower.includes('in-person')) mode = 'offline';
          else if (lower.includes('online') || lower.includes('virtual')) mode = 'online';

          if (lower.includes('₹') || lower.includes('$') || lower.includes('prize') || lower.includes('lakh') || lower.includes('crore')) {
            prizePool = p.trim();
          }

          if (/\d{1,2}\s+[A-Za-z]{3}\s+\d{4}/.test(p)) {
            deadline = normalizeDate(p);
          }
        }
      } else {
        name = line.replace(url, '').replace(/[\|\-\:]+$/, '').trim();
        if (!name || name.length < 3) {
          try {
            const parsedUrl = new URL(url);
            name = parsedUrl.hostname.replace(/^www\./, '').split('.')[0];
            name = name.charAt(0).toUpperCase() + name.slice(1) + ' Hackathon';
          } catch {
            name = 'Upcoming Hackathon';
          }
        }
      }

      if (line.toLowerCase().includes('hybrid')) mode = 'hybrid';
      else if (line.toLowerCase().includes('offline') || line.toLowerCase().includes('in-person')) mode = 'offline';

      if (line.toLowerCase().includes('cyber')) domains.push('Cybersecurity');
      if (line.toLowerCase().includes('health') || line.toLowerCase().includes('medical')) domains.push('Healthcare');
      if (line.toLowerCase().includes('robot')) domains.push('Robotics');
      if (line.toLowerCase().includes('blockchain') || line.toLowerCase().includes('web3')) domains.push('Web3');
      if (line.toLowerCase().includes('energy') || line.toLowerCase().includes('climate') || line.toLowerCase().includes('green')) domains.push('Sustainability');
      domains = Array.from(new Set(domains));

      description = `${name} hosted by ${org}. Mode: ${mode}. ${prizePool ? `Prize Pool: ${prizePool}.` : ''} Official registration via link.`;

      opportunities.push({
        name: name.slice(0, 100),
        organization: org.slice(0, 80),
        category: 'hackathon',
        mode,
        location: mode === 'online' ? 'Virtual Worldwide' : mode === 'hybrid' ? 'Hybrid / Worldwide' : 'In-person',
        geography: 'international',
        prizePool: prizePool || undefined,
        deadline,
        domains,
        skills: ['Python', 'TypeScript'],
        eligibility,
        description,
        officialUrl: url,
        registrationUrl: url,
        source: defaultSource,
        confidence: 0.93,
        status: 'open',
        verificationStatus: 'pending',
      });
    }
  }

  return opportunities;
}

/**
 * Built-in dataset representing the exact hackathons from the September 2026 Hackathon List PDF
 * provided by the user in the prompt screenshot and OCR.
 * Enables 1-click sample loading and testing.
 */
export const SAMPLE_SEPTEMBER_2026_HACKATHONS: Partial<Opportunity>[] = [
  {
    name: 'Fund My Crazy 2026',
    organization: 'Google Gemini / GSA IITG',
    category: 'hackathon',
    mode: 'online',
    location: 'Online / Global',
    geography: 'international',
    prizePool: '₹1 crore+ cash + Pixel 10a + IIT trip + swag',
    deadline: '2026-09-15',
    domains: ['AI/ML', 'Healthcare', 'Education', 'Transport'],
    skills: ['Gemini API', 'Python', 'AI Agents'],
    eligibility: '13+; students; open internationally subject to restrictions',
    description: 'Build breakthrough applications using Google Gemini across Transport, Community, Healthcare, Education, and Markets.',
    officialUrl: 'https://fundmycrazy.com/index.html',
    registrationUrl: 'https://fundmycrazy.com/index.html',
    confidence: 0.98,
  },
  {
    name: 'IBM Z Datathon 2026',
    organization: 'IBM + Shooting Stars Foundation',
    category: 'hackathon',
    mode: 'hybrid',
    location: 'Hybrid / Worldwide',
    geography: 'international',
    prizePool: '$50,000',
    deadline: '2026-10-01',
    domains: ['AI/ML', 'Cloud', 'Data Science'],
    skills: ['LinuxONE', 'Data Science', 'Python'],
    eligibility: 'Undergrad/grad students globally, 18+',
    description: 'Technology for Good hackathon using Data and AI on IBM Z and LinuxONE infrastructure.',
    officialUrl: 'https://www.starhacks.org/ibm-z-datathon-2026',
    registrationUrl: 'https://www.starhacks.org/ibm-z-datathon-2026',
    confidence: 0.97,
  },
  {
    name: 'TATA Social Enterprise Challenge 2026',
    organization: 'Tata + IIM Calcutta Innovation Park',
    category: 'hackathon',
    mode: 'hybrid',
    location: 'Online + Kolkata Finale',
    geography: 'national',
    prizePool: 'Up to ₹10 lakh cash + incubation + up to ₹1 crore seed funding',
    deadline: '2026-09-10',
    domains: ['Social Impact', 'Sustainability', 'Entrepreneurship'],
    skills: ['Business Strategy', 'Product Design'],
    eligibility: 'Social enterprises / startups addressing social problems',
    description: 'Discover and foster social enterprises and sustainable grassroots ventures tackling pressing socio-economic challenges.',
    officialUrl: 'https://www.tatasechallenge.org/',
    registrationUrl: 'https://www.tatasechallenge.org/',
    confidence: 0.95,
  },
  {
    name: 'Shipaton 2026',
    organization: 'RevenueCat',
    category: 'hackathon',
    mode: 'online',
    location: 'Online / Global',
    geography: 'international',
    prizePool: '$740,000+ cash prizes + NYC trip + Times Square billboard',
    deadline: '2026-09-30',
    domains: ['Mobile', 'Software Development', 'Web Development'],
    skills: ['iOS', 'Android', 'Swift', 'Kotlin', 'React Native'],
    eligibility: 'Global; individuals/teams; no team-size limit. Next Gen category for students 13+',
    description: 'Build and ship a new iOS, Android, or macOS app utilizing RevenueCat SDK for in-app subscriptions and ads.',
    officialUrl: 'https://www.shipaton.com/',
    registrationUrl: 'https://www.shipaton.com/',
    confidence: 0.98,
  },
  {
    name: 'Tata Imagination Challenge 2026',
    organization: 'Tata Group',
    category: 'hackathon',
    mode: 'hybrid',
    location: 'Online + Mumbai Finale',
    geography: 'national',
    prizePool: '₹20 lakh total cash + sponsored Mumbai experience + Tata Trails',
    deadline: '2026-09-13',
    domains: ['Open Innovation', 'Business', 'Technology', 'Healthcare'],
    skills: ['Problem Solving', 'Strategy', 'Design Thinking'],
    eligibility: 'Full-time UG/PG students in India',
    description: 'Open innovation contest across technology, business, healthcare, and sustainability with mentorship from Tata leaders.',
    officialUrl: 'https://unstop.com/competitions/crp-tata-imagination-challenge-2026-tata-group-1740413',
    registrationUrl: 'https://unstop.com/competitions/crp-tata-imagination-challenge-2026-tata-group-1740413',
    confidence: 0.96,
  },
  {
    name: 'WHO Global Youth Competition',
    organization: 'World Health Organization',
    category: 'hackathon',
    mode: 'online',
    location: 'Online / Global',
    geography: 'international',
    prizePool: 'Global recognition + WHO Certificate',
    deadline: '2026-09-13',
    domains: ['Healthcare', 'Public Health', 'Communication'],
    skills: ['Health Informatics', 'Media', 'Communication'],
    eligibility: '18–35; students & young professionals',
    description: 'Design innovative health communication and public health solutions for influenza and COVID-19 prevention.',
    officialUrl: 'https://www.who.int/',
    registrationUrl: 'https://www.who.int/',
    confidence: 0.94,
  },
  {
    name: 'Wharton Global High School Investment Competition 2026–27',
    organization: 'Wharton Global Youth / University of Pennsylvania',
    category: 'hackathon',
    mode: 'hybrid',
    location: 'Online + Philadelphia Finale',
    geography: 'international',
    prizePool: 'Wharton Global Trophy & Honors',
    deadline: '2026-09-11',
    domains: ['FinTech', 'Investment', 'Economics'],
    skills: ['Portfolio Strategy', 'Financial Modeling'],
    eligibility: 'Grades 9–12 worldwide; teams of 4–6; educator advisor',
    description: 'Stock-market simulation and portfolio strategy challenge by the Wharton School of the University of Pennsylvania.',
    officialUrl: 'https://globalyouth.wharton.upenn.edu/competitions/investment-competition/',
    registrationUrl: 'https://globalyouth.wharton.upenn.edu/competitions/investment-competition/',
    confidence: 0.95,
  },
  {
    name: 'AI Builder Cup 2026',
    organization: 'Hack2skill + Google Cloud',
    category: 'hackathon',
    mode: 'hybrid',
    location: 'Online + Singapore Finale',
    geography: 'international',
    prizePool: '$30,000 cash + sponsored Singapore travel',
    deadline: '2026-10-04',
    domains: ['AI/ML', 'Cloud', 'Software Development'],
    skills: ['Google Cloud', 'Vertex AI', 'Python'],
    eligibility: 'Working professionals / entrepreneurs / startups; students not eligible',
    description: 'Build enterprise-grade AI applications and multimodal agentic workflows on Google Cloud and Vertex AI.',
    officialUrl: 'https://aibuildercup.com/',
    registrationUrl: 'https://aibuildercup.com/',
    confidence: 0.97,
  },
  {
    name: 'Amazon Developer Hackathon 2026 — Build, Ship, Shape',
    organization: 'Amazon',
    category: 'hackathon',
    mode: 'online',
    location: 'Online / Global',
    geography: 'international',
    prizePool: '$190,000 cash + AWS credits',
    deadline: '2026-10-23',
    domains: ['AI/ML', 'IoT', 'Cloud', 'Devices'],
    skills: ['AWS', 'Alexa+', 'Python', 'TypeScript'],
    eligibility: '18+ / legal age; global subject to restrictions',
    description: 'Develop next-generation AI experiences across Alexa+, Fire TV, Ring, and ambient computing devices.',
    officialUrl: 'https://amazonappdev2026.devpost.com/',
    registrationUrl: 'https://amazonappdev2026.devpost.com/',
    confidence: 0.98,
  },
  {
    name: 'Gloo AI Hackathon 2026',
    organization: 'Gloo',
    category: 'hackathon',
    mode: 'offline',
    location: 'Boulder, Colorado',
    geography: 'international',
    prizePool: '$200,000 total cash',
    deadline: '2026-10-06',
    domains: ['AI/ML', 'Social Good', 'Agents'],
    skills: ['AI Agents', 'LLMs', 'Fullstack Development'],
    eligibility: '18+; open to all experience levels & backgrounds',
    description: 'In-person AI for Good hackathon exploring human flourishing, collaborative agents, and community technology.',
    officialUrl: 'https://gloo.com/ai/hackathon',
    registrationUrl: 'https://gloo.com/ai/hackathon',
    confidence: 0.96,
  },
  {
    name: 'Robofest Gujarat 3.0',
    organization: 'GUJCOST, Dept. of Science & Technology, Govt. of Gujarat',
    category: 'hackathon',
    mode: 'hybrid',
    location: 'Gujarat, India',
    geography: 'national',
    prizePool: '₹5 Crore',
    deadline: '2026-09-20',
    domains: ['Robotics', 'AI/ML', 'Hardware'],
    skills: ['ROS 2', 'Embedded Systems', 'Computer Vision'],
    eligibility: 'School & college students nationwide',
    description: 'Premier national robotics championship featuring autonomous rovers, swarm robots, underwater crawlers, and hexapods.',
    officialUrl: 'https://robofest.gujarat.gov.in/',
    registrationUrl: 'https://robofest.gujarat.gov.in/',
    confidence: 0.97,
  },
  {
    name: 'Pixels to Products — Cloudinary AI Hackathon 2026',
    organization: 'HackIndia × Cloudinary',
    category: 'hackathon',
    mode: 'online',
    location: 'Online / Virtual',
    geography: 'national',
    prizePool: 'Up to ₹1,40,000 total (1st ₹1.2L + ₹20K Runner-up)',
    deadline: '2026-10-03',
    domains: ['AI/ML', 'Web Development', 'Computer Vision'],
    skills: ['Cloudinary API', 'Next.js', 'Generative AI'],
    eligibility: 'Developers, designers & builders across India; teams of 1–4',
    description: 'Build AI-powered media products, generative content workflows, and automated image/video transformation pipelines.',
    officialUrl: 'https://hackindia.org/2026/pixels-to-products-cloudinary-ai-hackathon-2026',
    registrationUrl: 'https://hackindia.org/2026/pixels-to-products-cloudinary-ai-hackathon-2026',
    confidence: 0.96,
  },
  {
    name: 'NASA Space Apps Challenge 2026',
    organization: 'NASA + international space-agency partners',
    category: 'hackathon',
    mode: 'hybrid',
    location: 'Global / Virtual + Local Cities',
    geography: 'international',
    prizePool: 'NASA Global Awards & Space Center Invitations',
    deadline: '2026-11-14',
    domains: ['Space Science', 'AI/ML', 'Earth Observation', 'Climate'],
    skills: ['Python', 'GIS', 'Data Visualization', 'Open Science'],
    eligibility: 'Open to all ages, skills & backgrounds; under-18s need guardian',
    description: 'Solve real-world challenges on Earth and in space using NASA open data and satellite telemetry.',
    officialUrl: 'https://www.spaceappschallenge.org/2026/',
    registrationUrl: 'https://www.spaceappschallenge.org/2026/',
    confidence: 0.99,
  },
  {
    name: 'Agentic Cinema: The Blockbuster Hackathon',
    organization: 'Google Cloud + IBM, Grafana Labs, Parallel, ClickHouse & Replit',
    category: 'hackathon',
    mode: 'online',
    location: 'Online / Devpost',
    geography: 'international',
    prizePool: '$75,000 cash (5 partner tracks × $15,000 each)',
    deadline: '2026-09-09',
    domains: ['AI/ML', 'Agents', 'Cloud', 'Media'],
    skills: ['Gemini API', 'Google Cloud Agent Builder', 'MCP'],
    eligibility: '18+/legal age of majority in country of residence; India is eligible',
    description: 'Build functional agents using Gemini + Google Cloud Agent Builder integrating partner MCP protocols for media & cinema.',
    officialUrl: 'https://agentic-cinema.devpost.com/',
    registrationUrl: 'https://agentic-cinema.devpost.com/',
    confidence: 0.98,
  },
  {
    name: 'Nebius × NVIDIA Global AI Hackathon',
    organization: 'Nebius + NVIDIA',
    category: 'hackathon',
    mode: 'online',
    location: 'Online / Global',
    geography: 'international',
    prizePool: '$50,000 total',
    deadline: '2026-10-30',
    domains: ['AI/ML', 'Cloud', 'GPU Computing'],
    skills: ['PyTorch', 'CUDA', 'NVIDIA TensorRT', 'Model Serving'],
    eligibility: 'Open globally subject to official restrictions',
    description: 'Develop and deploy scalable AI inference architectures and GPU-accelerated automation solutions on Nebius Cloud.',
    officialUrl: 'https://nebiusglobalaihackathon.devpost.com/',
    registrationUrl: 'https://nebiusglobalaihackathon.devpost.com/',
    confidence: 0.97,
  }
];
