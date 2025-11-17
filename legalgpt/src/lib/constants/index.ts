export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export interface Country {
  code: string;
  name: string;
  constitution: string;
  description: string;
}

export const COUNTRIES: Country[] = [
  {
    code: "IN",
    name: "India",
    constitution: "Indian Constitution",
    description: "The Constitution of India, adopted in 1950. Key aspects include: fundamental rights (Articles 12-35), directive principles of state policy (Articles 36-51), and the structure of government (Union, States, Union Territories). References IPC, CrPC, and state-specific laws.",
  },
  {
    code: "US",
    name: "United States",
    constitution: "U.S. Constitution",
    description: "The Constitution of the United States with Bill of Rights. Covers federal system, separation of powers, and individual rights. References U.S.C., CFR, and state laws.",
  },
  {
    code: "UK",
    name: "United Kingdom",
    constitution: "UK Constitutional Law",
    description: "Unwritten constitution based on common law, statutes, and conventions. Includes Parliamentary Sovereignty, Rule of Law, and statutory protections. References UK Acts of Parliament and common law principles.",
  },
  {
    code: "CA",
    name: "Canada",
    constitution: "Canadian Constitution Act, 1982",
    description: "Constitution Act, 1982 with Canadian Charter of Rights and Freedoms. Federal parliamentary system. References Canadian Criminal Code, Civil Code of Quebec, and provincial laws.",
  },
  {
    code: "AU",
    name: "Australia",
    constitution: "Australian Constitution",
    description: "The Constitution of the Commonwealth of Australia, adopted in 1901. Defines federal system and powers of Commonwealth and States. References Australian law and state-based legislation.",
  },
  {
    code: "ZA",
    name: "South Africa",
    constitution: "South African Constitution, 1996",
    description: "The Constitution of the Republic of South Africa, 1996. Establishes democracy and human rights framework. References Bill of Rights and South African legislation.",
  },
  {
    code: "SG",
    name: "Singapore",
    constitution: "Constitution of the Republic of Singapore",
    description: "The Constitution of Singapore, adopted in 1965. Defines fundamental liberties and structure of government. References Singapore Statutes and common law principles.",
  },
  {
    code: "MY",
    name: "Malaysia",
    constitution: "Malaysian Federal Constitution",
    description: "The Federal Constitution of Malaysia, adopted in 1957. Covers fundamental liberties, rights of citizens, and federal system. References Malaysian Statutes.",
  },
  {
    code: "DE",
    name: "Germany",
    constitution: "German Basic Law (Grundgesetz)",
    description: "The Basic Law for the Federal Republic of Germany, adopted in 1949. Emphasizes human dignity and constitutional rights. References German Civil Code (BGB) and Criminal Code (StGB).",
  },
  {
    code: "FR",
    name: "France",
    constitution: "French Constitution (Fifth Republic)",
    description: "The Constitution of the Fifth Republic (1958). Defines presidential system and rights framework. References French Civil Code, Penal Code, and EU law.",
  },
  {
    code: "NZ",
    name: "New Zealand",
    constitution: "New Zealand Constitutional Framework",
    description: "Unwritten constitution based on common law, statutes, and conventions. Key documents include Constitution Act 1986 and Bill of Rights Act 1990.",
  },
  {
    code: "JP",
    name: "Japan",
    constitution: "Constitution of Japan",
    description: "The Constitution of Japan, adopted in 1947 post-WWII. Emphasizes pacifism and democracy. References Japanese Civil Code and Criminal Code.",
  },
];

export const CONSTITUTION_SYSTEM_PROMPT_BASE = (
  country: Country
): string => `You are a senior attorney specializing in ${country.name}'s legal system. 
Provide legal advice based on the ${country.constitution}.

${country.description}

Guidelines:
- Cite specific articles, sections, and statute numbers
- Reference applicable laws and regulations from ${country.name}
- Explain how laws apply to the user's situation
- Consider case law and judicial precedents where relevant
- Maintain accuracy and clarity in legal interpretation`;
