import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ArrowLeft, BookOpen, Zap, Calculator, Globe, Landmark, Leaf, FlaskConical, Microscope, TrendingUp, Scale, BookMarked, ChevronRight } from 'lucide-react';

interface Guide {
  subject: string;
  icon: React.ReactNode;
  color: string;
  summary: string;
  keyPoints: string[];
  formulas?: string[];
}

const guides: Guide[] = [
  {
    subject: 'Mathematics',
    icon: <Calculator className="w-6 h-6" />,
    color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    iconColor: 'bg-blue-500/10 text-blue-400',
    summary: 'Master key formulas and problem-solving techniques for WAEC/JAMB success.',
    keyPoints: [
      'Algebra: Solve linear equations by isolating the variable (e.g., 2x + 3 = 11 → x = 4)',
      'Quadratic equations: Use the formula x = (−b ± √(b²−4ac)) / 2a',
      'Percentages: Part ÷ Whole × 100 (e.g., 30 out of 200 = 15%)',
      'Simple Interest: SI = (P × R × T) / 100',
      'Area of circle = πr² | Circumference = 2πr (use π = 22/7)',
      'Pythagoras Theorem: a² + b² = c² (for right-angled triangles)',
      'Probability: P(event) = Favourable outcomes / Total outcomes',
      'Mean = Sum of all values ÷ Number of values',
    ],
    formulas: [
      'Speed = Distance / Time',
      'Density = Mass / Volume',
      'Area of Triangle = ½ × base × height',
      'Volume of Cylinder = πr²h',
    ],
  } as any,
  {
    subject: 'Physics',
    icon: <Zap className="w-6 h-6" />,
    color: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
    iconColor: 'bg-yellow-500/10 text-yellow-400',
    summary: 'Core physics concepts and formulas used in WAEC and JAMB examinations.',
    keyPoints: [
      'Newton\'s 1st Law: An object stays at rest or in motion unless acted upon by a force',
      'Newton\'s 2nd Law: F = ma (Force = mass × acceleration)',
      'Newton\'s 3rd Law: Every action has an equal and opposite reaction',
      'Kinetic Energy: KE = ½mv² | Potential Energy: PE = mgh',
      'Ohm\'s Law: V = IR (Voltage = Current × Resistance)',
      'SI Units: Force = Newton (N), Energy = Joule (J), Power = Watt (W)',
      'Scalar quantities have magnitude only (speed, mass, temperature)',
      'Vector quantities have magnitude AND direction (velocity, force, acceleration)',
    ],
    formulas: [
      'Work = Force × Distance (W = Fd)',
      'Power = Work / Time (P = W/t)',
      'Pressure = Force / Area',
      'Wave Speed = Frequency × Wavelength',
    ],
  } as any,
  {
    subject: 'Chemistry',
    icon: <FlaskConical className="w-6 h-6" />,
    color: 'from-green-500/20 to-green-600/10 border-green-500/30',
    iconColor: 'bg-green-500/10 text-green-400',
    summary: 'Essential chemistry concepts from atomic structure to chemical reactions.',
    keyPoints: [
      'Atomic Number = number of protons | Mass Number = protons + neutrons',
      'Groups in Periodic Table: Group I = alkali metals, Group VII = halogens',
      'pH Scale: 0–6 = acidic, 7 = neutral, 8–14 = alkaline/basic',
      'Key chemical symbols: Na (Sodium), Fe (Iron), Au (Gold), K (Potassium), Pb (Lead)',
      'Types of bonding: Ionic (metal + non-metal), Covalent (non-metal + non-metal)',
      'Oxidation = loss of electrons | Reduction = gain of electrons (OIL RIG)',
      'Acid + Base → Salt + Water (neutralisation reaction)',
      'Electrolysis: cathode is negative, anode is positive',
    ],
    formulas: [
      'Mole = Mass / Molar Mass',
      'PV = nRT (Ideal Gas Law)',
      'Concentration = Moles / Volume (mol/L)',
    ],
  } as any,
  {
    subject: 'Biology',
    icon: <Microscope className="w-6 h-6" />,
    color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
    iconColor: 'bg-emerald-500/10 text-emerald-400',
    summary: 'From cell biology to ecology — key biological concepts for your exams.',
    keyPoints: [
      'Cell is the basic unit of life. Animal cells have no cell wall; plant cells do',
      'Photosynthesis: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂ (in chloroplasts)',
      'Respiration: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP energy',
      'DNA carries genetic information. DNA → mRNA → Protein (central dogma)',
      'Mitosis: cell division producing 2 identical daughter cells (growth)',
      'Meiosis: cell division producing 4 gametes with half chromosomes (reproduction)',
      'Blood functions: transport nutrients/O₂, defence (WBC), clotting (platelets)',
      'Ecosystem: producers (plants) → primary consumers → secondary consumers',
    ],
    formulas: [
      'Magnification = Image size / Actual size',
      'Breathing rate increases with CO₂ concentration',
    ],
  } as any,
  {
    subject: 'Economics',
    icon: <TrendingUp className="w-6 h-6" />,
    color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
    iconColor: 'bg-purple-500/10 text-purple-400',
    summary: 'Macro and microeconomics fundamentals for WAEC, NECO, and JAMB.',
    keyPoints: [
      'Scarcity = unlimited wants + limited resources → the basic economic problem',
      'Microeconomics studies individual consumers, firms, and markets',
      'Macroeconomics studies the economy as a whole (GDP, inflation, unemployment)',
      'Law of Demand: price ↑ → quantity demanded ↓ (inverse relationship)',
      'Law of Supply: price ↑ → quantity supplied ↑ (direct relationship)',
      'Equilibrium: where demand curve meets supply curve',
      'Inflation = general rise in price level; Deflation = general fall in prices',
      'GDP (Gross Domestic Product) = total value of goods and services in a country',
    ],
  } as any,
  {
    subject: 'Government',
    icon: <Landmark className="w-6 h-6" />,
    color: 'from-red-500/20 to-red-600/10 border-red-500/30',
    iconColor: 'bg-red-500/10 text-red-400',
    summary: 'Nigerian government, constitutions, and political science fundamentals.',
    keyPoints: [
      'Federalism: power shared between central and regional governments (like Nigeria)',
      'Separation of Powers: Legislative (NASS), Executive (President), Judicial (Courts)',
      'Checks and Balances prevent any one branch from becoming too powerful',
      'Nigeria\'s current constitution: 1999 Constitution (as amended)',
      'INEC (Independent National Electoral Commission) conducts Nigerian elections',
      'Franchise: the right to vote and be voted for (suffrage)',
      'Montesquieu popularised the doctrine of separation of powers',
      'Nigeria became a republic on October 1, 1963; Independence: October 1, 1960',
    ],
  } as any,
  {
    subject: 'English Language',
    icon: <BookMarked className="w-6 h-6" />,
    color: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
    iconColor: 'bg-orange-500/10 text-orange-400',
    summary: 'Grammar, comprehension, and vocabulary tips for English success.',
    keyPoints: [
      'Parts of speech: Noun, Pronoun, Verb, Adjective, Adverb, Preposition, Conjunction, Interjection',
      'Clauses: Noun clause (acts as noun), Adjectival (modifies noun), Adverbial (modifies verb)',
      'Tenses: Simple present, Past, Future; Continuous, Perfect, Perfect Continuous',
      'Active voice: "The dog bit the man" | Passive: "The man was bitten by the dog"',
      'Synonyms = words with similar meanings | Antonyms = opposite meanings',
      'Literary devices: Simile (like/as), Metaphor (direct comparison), Hyperbole (exaggeration), Personification (giving human traits to objects)',
      'Double consonants: Accommodation, Occurrence, Committee, Necessary, Embarrassment',
      'Concord: Subject and verb must agree in number (He runs, They run)',
    ],
  } as any,
  {
    subject: 'Digital Technology',
    icon: <Globe className="w-6 h-6" />,
    color: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30',
    iconColor: 'bg-cyan-500/10 text-cyan-400',
    summary: 'Web tech abbreviations, AI, networks, and computer fundamentals.',
    keyPoints: [
      'HTML = HyperText Markup Language | CSS = Cascading Style Sheets | JS = JavaScript',
      'PHP = PHP: Hypertext Preprocessor | SQL = Structured Query Language',
      'CPU = Central Processing Unit | RAM = Random Access Memory | ROM = Read-Only Memory',
      'AI = Artificial Intelligence | ML = Machine Learning | IoT = Internet of Things',
      'LAN (room/building) → MAN (city) → WAN (country/world)',
      'Popular AI models: ChatGPT (OpenAI), Gemini (Google), Claude (Anthropic), LLaMA (Meta)',
      'Computer Generations: 1st=Vacuum tubes, 2nd=Transistors, 3rd=ICs, 4th=Microprocessors, 5th=AI',
      'Firewall = security barrier | HTTPS = encrypted HTTP | URL = Uniform Resource Locator',
    ],
    formulas: [
      'Data + Processing = Information',
      'Hierarchy: Character → Field → Record → File → Database',
    ],
  } as any,
  {
    subject: 'Agricultural Science',
    icon: <Leaf className="w-6 h-6" />,
    color: 'from-lime-500/20 to-lime-600/10 border-lime-500/30',
    iconColor: 'bg-lime-500/10 text-lime-400',
    summary: 'Crop science, animal husbandry, and farm management for WAEC/NECO.',
    keyPoints: [
      'Photosynthesis in crops requires sunlight, water, CO₂, and chlorophyll',
      'Types of farming: Subsistence (for family), Commercial (for profit), Mixed farming',
      'Soil types: Sandy (well-drained, low nutrients), Clay (holds water), Loam (best for crops)',
      'NPK fertilisers: N = Nitrogen (leaf growth), P = Phosphorus (root growth), K = Potassium (fruit)',
      'Crop rotation prevents soil depletion and controls pests and diseases',
      'Major Nigerian food crops: Cassava, Yam, Maize, Rice, Millet, Sorghum',
      'Animal husbandry: rearing of livestock including cattle, goats, pigs, and poultry',
      'Farm tools: Hoe (weeding), Cutlass (clearing), Tractor (ploughing), Irrigation pump',
    ],
  } as any,
  {
    subject: 'Commerce',
    icon: <Scale className="w-6 h-6" />,
    color: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30',
    iconColor: 'bg-indigo-500/10 text-indigo-400',
    summary: 'Trade, business documents, and commercial activities for exams.',
    keyPoints: [
      'Barter: exchange of goods for goods without money — problem: double coincidence of wants',
      'Types of trade: Home trade (within country), Foreign trade (between countries)',
      'Wholesale: buys in bulk from producers, sells to retailers',
      'Retail: buys from wholesalers, sells directly to final consumers',
      'Business documents: Invoice (bill for goods), Receipt (proof of payment), Waybill (for transported goods)',
      'Letter of Credit: bank guarantee for international trade payments',
      'Stock-in-trade: goods purchased specifically for resale (current asset)',
      'E-commerce: buying and selling goods/services over the internet',
    ],
  } as any,
];

export default function StudyGuides() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">Study Guides</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Quick Revision Guides</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Key formulas, definitions, and concepts organised by subject — perfect for last-minute revision before WAEC, NECO, and JAMB.
          </p>
        </div>

        {/* Guides Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {guides.map((guide) => (
            <GuideCard key={guide.subject} guide={guide} />
          ))}
        </div>

        {/* Tips Section */}
        <div className="mt-12 bg-primary/5 border border-primary/20 rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-4 text-primary">📌 General Exam Tips</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Read all questions carefully before answering — allocate time per question',
              'Start with questions you know to build confidence and save time',
              'For multiple choice, eliminate obviously wrong options first',
              'In calculations, always show your working — partial marks count',
              'Manage your time: don\'t spend too long on one question',
              'Review your answers if time allows — check for careless mistakes',
              'Learn abbreviations and acronyms — they appear in every WAEC/JAMB paper',
              'Practice past questions daily — patterns repeat every 3–5 years',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function GuideCard({ guide }: { guide: Guide & { iconColor: string } }) {
  return (
    <Card className={`overflow-hidden bg-gradient-to-br ${guide.color}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-12 h-12 ${guide.iconColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
            {guide.icon}
          </div>
          <div>
            <h3 className="text-xl font-bold">{guide.subject}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{guide.summary}</p>
          </div>
        </div>

        {/* Key Points */}
        <div className="space-y-2 mb-4">
          {guide.keyPoints.map((point, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span className="w-5 h-5 rounded-full bg-background/50 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 text-primary">
                {i + 1}
              </span>
              <p className="text-muted-foreground leading-relaxed">{point}</p>
            </div>
          ))}
        </div>

        {/* Formulas */}
        {guide.formulas && guide.formulas.length > 0 && (
          <div className="bg-background/40 rounded-xl p-4 mt-2">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">Key Formulas</p>
            <div className="space-y-1.5">
              {guide.formulas.map((formula, i) => (
                <p key={i} className="text-sm font-mono text-foreground/80 flex items-center gap-2">
                  <span className="text-primary">▸</span>
                  {formula}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
