export type WorkHighlight = {
  number: string;
  title: string;
  company: string;
  category: string;
  challenge: string;
  contribution: string;
  technologies: string[];
  caseStudyUrl?: string;
};

// Editorial source: Profile.pdf (LinkedIn export). Keep claims and dates grounded
// in that document. Optional case-study links appear only when a URL is supplied.
export type FocusArea = {
  title: string;
  description: string;
};

export const profile = {
  name: "Ahmad Aghazadeh",
  role: "Senior Software Engineer",
  email: "ahmad.aghazadeh.a@gmail.com",
  intro: "I build scalable backend systems and full-stack applications. Turning complex requirements into software that stays clear, reliable, and ready to grow.",
  focusIntro: "Building reliable backend services and distributed systems, while exploring how agentic AI can support software development.",
  focusAreas: [
    { title: "Scalable backend systems", description: "C# and .NET, microservices, and event-driven architecture — designed for clarity, reliability, and growth." },
    { title: "Agentic engineering", description: "Exploring how AI agents can support the way we design, build, and maintain software." },
  ] satisfies FocusArea[],
  about: [
    "Good software starts with understanding the problem. For over 14 years, I’ve worked across backend services, web applications, and mobile products — connecting the details of implementation to the bigger architectural picture.",
    "My home ground is C# and .NET, with a focus on distributed systems, clean architecture, and test-driven development. I care just as much about how a team works: thoughtful code reviews, shared knowledge, and helping other developers grow.",
    "Today, I’m also exploring agentic engineering and how AI can support the way we design, build, and maintain software. Always curious. Always building.",
  ],
  availability: "Open to senior engineering opportunities in Europe, including relocation and visa sponsorship, and conversations about meaningful technical collaborations.",
  links: [
    { label: "GitHub", url: "https://github.com/ahmadaghazadeh" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/ahmadaghazadeh" },
    { label: "Stack Overflow", url: "https://stackoverflow.com/users/1770868/ahmad-aghazadeh" },
  ],
  experience: [
    { company: "Bet Technology", role: "Software Engineer", period: "May 2025 — Present", location: "Sydney, Australia · Remote", description: "Building scalable betting-feed services with Azure Service Fabric, the Actor model, event-driven processing, and test-driven development.", tags: ["Service Fabric", "Azure Service Bus", "Cosmos DB"] },
    { company: "Specific-Group Austria", role: "Software Engineer", period: "May 2024 — Apr 2025", location: "Vienna, Austria · Remote", description: "Developed a restaurant application suite and ISP software, combining microservices and CQRS with testing, payment integrations, and observability.", tags: [".NET Core", "PostgreSQL", "OpenTelemetry"] },
    { company: "Bulut", role: "Software Engineer", period: "Jul 2022 — May 2024", description: "Worked on shipping and delivery systems, API integration, eventual consistency, central authentication, and delivery pipelines in close collaboration with UI/UX teams.", tags: ["Messaging", "CI/CD", "ELK"] },
    { company: "Shoniz", role: "Software Engineer · Android Developer", period: "Jan 2011 — Jul 2022", description: "Grew across mobile and backend engineering: ordering and market research applications, authentication services, REST APIs, and real-time dashboards. Led a team of three developers.", tags: ["C#", "Kotlin", "SQL Server"] },
  ],
  expertise: [
    { number: "01", title: "Backend engineering", description: "Clear boundaries. Maintainable foundations.", skills: ["C# / .NET", "REST APIs", "Clean Architecture", "DDD", "CQRS", "SQL Server", "PostgreSQL"] },
    { number: "02", title: "Distributed systems", description: "Built to communicate. Designed to scale.", skills: ["Microservices", "Event-driven architecture", "Azure Service Bus", "RabbitMQ", "Redis", "Cosmos DB"] },
    { number: "03", title: "Delivery & reliability", description: "Confidence from the first test to production.", skills: ["TDD", "Docker", "Kubernetes", "CI/CD", "OpenTelemetry", "Prometheus", "Code reviews"] },
    { number: "04", title: "Beyond the backend", description: "A full view of the product experience.", skills: ["React", "JavaScript", "Android", "Kotlin", "Jetpack Compose", "Agentic AI development"] },
  ],
  education: "Bachelor of Engineering · Software Engineering Technology",
  university: "University of Applied Science and Technology",
};

export const workHighlights: WorkHighlight[] = [
  { number: "01", title: "Real-time betting feeds", company: "Bet Technology", category: "DISTRIBUTED SYSTEMS", challenge: "Processing live betting data with scalability and high availability in mind.", contribution: "Redesigned the feed reader with Azure Service Fabric and the Actor model, backed by event-driven processing and test-driven development.", technologies: ["Service Fabric", "Azure Service Bus", "Cosmos DB" ] },
  { number: "02", title: "Connected restaurant experiences", company: "Specific-Group Austria", category: "PRODUCT ENGINEERING", challenge: "Connecting a five-app restaurant suite through a consistent set of APIs and integrations.", contribution: "Built applications around RESTful APIs described with OpenAPI, integrating Stripe payments and Twilio communications.", technologies: ["REST APIs", "OpenAPI", "Stripe", "Twilio"] },
  { number: "03", title: "Shipping, in sync", company: "Bulut", category: "EVENT-DRIVEN ARCHITECTURE", challenge: "Keeping shipping and sales services consistent across a distributed workflow.", contribution: "Designed eventual consistency using messaging, caching, and contract testing, alongside API delivery pipelines and ELK monitoring.", technologies: ["Messaging", "Caching", "Contract testing", "ELK"] },
  { number: "04", title: "From order to insight", company: "Shoniz", category: "FULL-STACK & MOBILE", challenge: "Supporting ordering and market research across mobile applications and backend services.", contribution: "Built APIs serving three million monthly requests, developed real-time dashboards, and led a three-developer team using clean architecture.", technologies: ["C#", "Kotlin", "REST APIs", "SQL Server"] },
];
