// Auto-generated from PRADAR Excel template. Do not edit by hand.
export interface PradarTemplateItem {
  id: string;
  row: number;
  component: string;
  subDomain: string;
  domain: string;
  controlQuestion: string;
  drlNo: number;
  proof: string;
  basis: string | null;
  ratingGuide: string;
}

export const PRADAR_ITEMS: PradarTemplateItem[] = [
  {
    "id": "q1",
    "row": 4,
    "component": "Organizational Commitment",
    "subDomain": "Management Buy-in",
    "domain": "Establish Data Privacy Governance",
    "controlQuestion": "Does management provide the resources needed to effectively implement your Privacy Management Program (PMP)?",
    "drlNo": 1,
    "proof": "Budget allocation document/ Resource Allocation Plans",
    "basis": "Basis: NPC Circular 2023-06;\n\nThe budget should be proportionate to the nature of the personal data, the risks involved in processing, the size of the organization, the volume of data processed, and current data privacy best practices in the industry.",
    "ratingGuide": "Rating 1 – Not Compliant:\nNo budget or resources for the PMP. Management does not provide support.\n\nRating 2 – Partially Compliant:\nNo formal PMP budget. Management provides occasional resources, but allocation is reactive and does not align with risks or best practices.\n\nRating 3 – Substantially Compliant:\nDocumented PMP budget exists, but resource allocation is inconsistent. Resources may not be sufficient or aligned with risks, affecting full implementation.\n\nRating 4 – Fully Compliant:\nApproved PMP budget is in place. Management provides adequate resources aligned with risks, data volume, and best practices, ensuring full support for the program."
  },
  {
    "id": "q2",
    "row": 5,
    "component": "Organizational Commitment",
    "subDomain": "Management Buy-in",
    "domain": "Establish Data Privacy Governance",
    "controlQuestion": "Has management issued a communication or memorandum outlining the organization’s compliance targets to support adherence to the Data Privacy Act of 2012 (DPA)?",
    "drlNo": 2,
    "proof": "Signed policy or statements of commitment to data privacy, \n\nData privacy implementation plans or compliance roadmaps endorsed by management, or;\n\nMeeting minutes showing management discussion or approval of data privacy initiatives.",
    "basis": null,
    "ratingGuide": "Rating 1 – Not Compliant:\nNo documented communication from management outlining compliance targets for the DPA, and no informal communication exists.\n\nRating 2 – Partially Compliant:\nNo formal memo, but there are verbal instructions or informal discussions showing management’s intent to meet privacy compliance.\n\nRating 3 – Substantially Compliant:\nA formal memo exists outlining compliance targets, but practice is inconsistent. The memo may not be fully shared, updated, or supported, leading to partial implementation.\n\nRating 4 – Fully Compliant:\nManagement has issued and shared a clear memo outlining data privacy compliance targets, supported by ongoing initiatives and aligned with the DPA."
  },
  {
    "id": "q3",
    "row": 6,
    "component": "Organizational Commitment",
    "subDomain": "Data Protection Officer",
    "domain": "Establish Data Privacy Governance",
    "controlQuestion": "Have you appointed and registered a Data Protection Officer (DPO) with the National Privacy Commission (NPC)?",
    "drlNo": 3,
    "proof": "Appointment Papers / Contract of the DPO and/or DPO team (Notarized)",
    "basis": "Basis: NPC Circular No. 2022-04\n\nInaugural DPO must be registered with the NPC within 20 days from effectivity of the appointment. Change in the DPO within ten (10) days from effectivity of the appointment of the new DPO\n\nUnless otherwise allowed by law or the Commission, the DPO must be an organic employee of the government agency or private entity.\n\nFOR GOVERNMENT AGENCY\n\nMust designate and register a DPO according to the rank of its highest official:\n• Department Secretary or equivalent: DPO rank not lower than Assistant Secretary or Executive Director IV\n• Undersecretary or equivalent: DPO rank at least Director IV\n• Assistant Secretary or equivalent: DPO rank at least Director II\n• Regional Director or equivalent: DPO rank at least Division Chief\n\nFor Local Government Units (LGUs):\n• Provincial, City, and Municipal levels must designate a DPO with a rank not lower than Department Head.\n• Cities and Municipalities may designate a Compliance Officer for Privacy (COP) at the Barangay level, under the supervision of the City or Municipal DPO.",
    "ratingGuide": "Rating 1 – Not Compliant:\nNo documented appointment or NPC registration of a DPO.\n\nRating 2 – Partially Compliant:\nA DPO is informally designated, but there is no formal appointment or NPC registration.\n\nRating 3 – Substantially Compliant:\nA DPO is formally appointed and registered, but may not fully meet eligibility requirements or registration is delayed.\n\nRating 4 – Fully Compliant:\nA DPO is formally appointed and registered within required timelines. The DPO meets all eligibility criteria, and documentation is complete, up-to-date, and fully compliant."
  },
  {
    "id": "q4",
    "row": 7,
    "component": "Organizational Commitment",
    "subDomain": "Data Protection Officer",
    "domain": "Establish Data Privacy Governance",
    "controlQuestion": "Is the DPO’s role clearly defined?",
    "drlNo": 4,
    "proof": "Duties and responsibilities in the Appointment Papers / Contract of the DPO / Privacy Manual",
    "basis": "Basis: NPC Advisory No. 2017-01\n\na. Monitor the organization's compliance with the DPA, its IRR, NPC issuances, and other related laws and policies.\nb. Oversee the conduct of Privacy Impact Assessments.\nc. Handle data subject complaints and requests to exercise their rights.\nd. Manage and report data breaches and security incidents. \ne. Promote privacy awareness and compliance within the organization.\nf. Support the development and review of privacy-related policies and programs using a privacy-by-design approach.\ng. Act as the main contact for data subjects, the NPC, and other authorities on privacy matters.\nh. Coordinate and seek guidance from the NPC on data privacy and security concerns.",
    "ratingGuide": "Rating 1 – Not Compliant:\nNo documented DPO role, and no evidence that key responsibilities are being performed.\n\nRating 2 – Partially Compliant:\nThe DPO’s role is not formally documented, but there is evidence of the DPO informally handling some duties. Key responsibilities are not clearly defined or consistently carried out.\n\nRating 3 – Substantially Compliant:\nThe DPO’s role is documented and covers several responsibilities, but implementation is inconsistent. Some duties are irregularly or partially carried out, causing gaps between documentation and practice.\n\nRating 4 – Fully Compliant:\nThe DPO role is clearly documented, covering all key responsibilities. The DPO consistently performs these duties in practice, demonstrating full compliance."
  },
  {
    "id": "q5",
    "row": 8,
    "component": "Organizational Commitment",
    "subDomain": "Reporting Mechanisms",
    "domain": "Establish Data Privacy Governance",
    "controlQuestion": "Is there a defined process for reporting privacy issues, incidents, or breaches, along with regular privacy and compliance reports, clearly communicated to all employees?",
    "drlNo": 5,
    "proof": "Documented Escalation / Reporting Procedure",
    "basis": null,
    "ratingGuide": "Rating 1 – Not Compliant:\nNo documented process for reporting privacy issues or breaches. Employees do not know how to report incidents, and there are no clear channels or procedures, leading to unreported or unmanaged issues.\n\nRating 2 – Partially Compliant:\nA process exists but is informal or ad-hoc. There is no standardized procedure, and employees report incidents through inconsistent or unstructured channels, with limited communication about the process.\n\nRating 3 – Substantially Compliant:\nA documented process is in place, but it is not consistently implemented. The process may not be fully communicated to all employees, and there are gaps in reporting, escalation, or follow-through.\n\nRating 4 – Fully Compliant:\nA well-documented and clear process for reporting issues or breaches exists. The process is communicated to all employees, consistently followed, and supports timely escalation and response. Employees are fully aware and use the procedure for reporting incidents."
  },
  {
    "id": "q6",
    "row": 9,
    "component": "Program Controls",
    "subDomain": "Records of Processing Activities",
    "domain": "Privacy Risk Assessment",
    "controlQuestion": "Do you have an inventory of all data processing systems (DPS) and activities?",
    "drlNo": 6,
    "proof": "Records of Processing Activities (RoPA) / Data Processing Systems Inventory                                                     ",
    "basis": "Basis: Section 26(c), IRR\n\nRecords should include:\n1. The purpose of processing personal data, including any future processing or data sharing;\n2. A description of the categories of data subjects, personal data, and recipients involved in the processing;\n3. General details on data flow within the organization—from collection, processing, and retention to disposal or deletion—including time limits;\n4. A summary of the organizational, physical, and technical security measures in place;\n5. The name and contact details of the personal information controller, joint controller (if any), representative, and the DPO or other responsible compliance officers. ",
    "ratingGuide": "Rating 1 – Not Compliant:\nNo documented inventory of data processing systems or activities.\n\nRating 2 – Partially Compliant:\nNo formal inventory, but some systems or activities are tracked informally. Records are incomplete and lack required details.\n\nRating 3 – Substantially Compliant:\nA documented inventory exists, covering some required details, but implementation is inconsistent. Some systems or key details may be missing or not regularly updated.\n\nRating 4 – Fully Compliant:\nA complete and updated inventory exists, covering all required details."
  },
  {
    "id": "q7",
    "row": 10,
    "component": "Program Controls",
    "subDomain": "Registration",
    "domain": "Privacy Risk Assessment",
    "controlQuestion": "Have you registered your DPS with the NPC and ensured their annual renewal?",
    "drlNo": 7,
    "proof": "NPC Certificate of Registration and Seal of Registration\n\nDPS Registration via NPC Registration System (NPC-RS)",
    "basis": "Basis: NPC Circular No. 2022-04\n\nMandatory Registration:\nPICs or PIPs with 250 or more employees;\nPICs or PIPs processing sensitive personal information of 1,000 or more individuals;\nPICs or PIPs whose processing may pose risks to data subjects’ rights and freedoms; or\nThose processing data that may likely risk or affect the rights and freedoms of data subjects (e.g., government processing).\n\nAn application for registration filed must be duly notarized and be accompanied by the following documents: \n\nA. For Government Agencies: Special or Office Order, or any similar document, designating or appointing the DPO; \n\nB. For Domestic Private Entities:\n1. For Corporations: \na) duly notarized Secretary’s Certificate authorizing the appointment or designation of the DPO; or any other document demonstrating the validity of the appointment or designation of the DPO, signed by the Head of the Organization, accompanied by a valid document conferring authority to the Head of Organization to designate or appoint persons to positions in the organization. \nb) Securities and Exchange Commission (SEC) Certificate of Registration.\nc) certified true copy of latest General Information Sheet.\nd) valid business permit.\n2. One Person Corporation: \na) duly notarized Secretary’s Certificate authorizing the appointment or designation of DPO, or (2) any other document that demonstrates the validity of the appointment or designation of DPO signed by the sole director of the One Person Corporation.\nb) SEC Certificate of Registration \nc) valid business permit\n3. Partnership \na) duly notarized Partnership Resolution or Special Power of Attorney authorizing the appointment or designation of DPO, or any other document that demonstrates the validity of the appointment or designation.\nb) SEC Certificate of Registration.\nc) valid business permit\n4.Sole Proprietorships\na) duly notarized document appointing the DPO and signed by the sole proprietor, in case the same should elect to appoint or designate another person as DPO. \nb) DTI Certificate of Registration.\nc) valid business permit\n\nC Foreign Entity: \n1.Authenticated copy or Apostille of Secretary’s Certificate authorizing the appointment or designation of DPO+ English translation if needed\n2.Authenticated copy or Apostille of the following documents, with an English translation thereof if in a language other than English, where applicable: a)Latest General Information Sheet or any similar document; b)Registration Certificate (Corporation, Partnership, Sole Proprietorship) or any similar document; c)Valid business permit or any similar document",
    "ratingGuide": "Rating 1 – Not Compliant:\nThe organization has not registered its DPS with the NPC, and renewals are not done.\n\nRating 2 – Partially Compliant:\nSome effort is shown, like preparing documents or informal tracking of DPS, but no formal submission to the NPC. Registration may be incomplete, and annual renewals are not done.\n\nRating 3 – Substantially Compliant:\nThe organization has registered its DPS with the NPC and submitted most required documents, but some are outdated or incomplete. Some DPS may be missing, and renewals may not always be on time.\n\nRating 4 – Fully Compliant:\nAll applicable DPS are fully registered with the NPC. All supporting documents are complete and submitted. Annual renewals are done consistently, and records are kept up to date."
  },
  {
    "id": "q8",
    "row": 11,
    "component": "Program Controls",
    "subDomain": "Risk Assessment",
    "domain": "Privacy Risk Assessment",
    "controlQuestion": "Do you conduct a Privacy Impact Assessment (PIA) for your DPS?",
    "drlNo": 8,
    "proof": "PIA Report",
    "basis": "Basis: NPC Circular 2023-06; NPC Advisory No. 2017-03\n\nA PIA should be evaluated every year: Provided, that such assessment shall be updated as necessary (e.g., new features or major changes in processing, new regulations, new contracts entered by the PIC, or changes in its PIP).\n\nA PIA should be undertaken for every processing system that involves personal data.\n\nThe PIA shall include the following:\nA. a data inventory identifying: \n1.the amount and type of personal data held by the PIC and its PIP, if any, including records of its own personnel; \n2.list of all information repositories holding personal data, including location; \n3.type of media used for storing the personal data; \n4.risks associated with the processing of personal data; and \n5.processing operations for the entire personal data life cycle, from collection to disposal or destruction; \nB. a systematic description of the personal data being processed or to be processed, including the purposes for such processing, anticipated purposes, and their corresponding lawful bases; \nC. an assessment of the general data privacy principles in relation to the processing; \nD. a holistic assessment of the risks to the rights and freedoms of a data subject; and \nE. an assessment of risks to the confidentiality, integrity, and availability of personal data against any accidental or unlawful destruction, alteration, and disclosure, as well as against any other unlawful processing.\n\nThe risks identified in the PIA must be addressed by a Control Framework. \nThe contents of a Control Framework shall take into account, among others, the following: \nA. Nature of the personal data to be protected; \nB. Risks represented by the processing, the size of the organization, and the volume of personal data being processed; \nC. Current data privacy best practices in a specific industry; \nD. Cost of security implementation; and \nE. Purpose and extent of data sharing or outsourcing agreements and their attendant risks. \n\nMust also conduct a PIA on its Off-The-Shelf Software, solutions, or data processing systems.",
    "ratingGuide": "Rating 1 – Not Compliant:\nNo PIA has been conducted for any DPS.\n\nRating 2 – Partially Compliant:\nPIAs are done informally or ad-hoc for some systems, but there is no formal documentation or consistent schedule. Key elements are missing or inconsistently applied.\n\nRating 3 – Substantially Compliant:\nPIAs are documented for most systems and include some required elements, but updates or implementation are inconsistent. Some assessments may be incomplete or outdated.\n\nRating 4 – Fully Compliant:\nPIAs are conducted for all DPS, including off-the-shelf software and outsourced systems. They are properly documented, reviewed annually, and updated for system changes, new regulations, or features."
  },
  {
    "id": "q9",
    "row": 12,
    "component": "Program Controls",
    "subDomain": "Policies and Procedures",
    "domain": "Maintain Organization Commitment",
    "controlQuestion": "Have you implemented a Privacy Manual/ Data Protection Policies?",
    "drlNo": 9,
    "proof": "Privacy Manual / Data Protection Policies (e.g., Security Policy, Access Control Policy/Security Clearance, Acceptable Use Policy, Password Policy, Business Continuity Plan, Telecommuting, CCTV Policy, Retention Policy, Privacy-By-Design and Privacy-By-Default principles)",
    "basis": "Basis: Sec. 26(b)(e), IRR; NPC Privacy 3rd Toolkit p. 82-89\n\nImplement data protection policies covering organizational, physical, and technical security measures. These policies must:\n• Consider the nature, scope, context, and purpose of processing, as well as risks to data subjects’ rights and freedoms.\n• Apply data protection principles when determining and performing processing activities.\n• Ensure only necessary personal data is processed, stored, and accessed.\n• Clearly define data volume, processing scope, retention period, and access controls.\n• Require regular documentation, review, evaluation, and updating of privacy and security measures.\n\nPrivacy Manual Guide\n1. Introduction\n2. Definition of Terms\n3. Scope and Limitations\n4. Processing of Personal Data - Collection, Use, Storage, Retention, and Destruction, Access, Disclosure and Sharing\n5. Security Measures\n• Organizational Measures - Conduct of Privacy Impact Assessment (PIA); Designation of the Data Protection Officer (DPO); Functions of the DPO and other responsible personnel; Duty of Confidentiality; Regular trainings/seminars on data privacy and security; Review of the Privacy Manual; Documentation of DPO and organizational compliance activities\n• Physical Measures - Data format, storage type, and location; Access procedures and monitoring controls; Office/workstation design; Roles and responsibilities of personnel involved in processing; Data transfer procedures (internal and external); Data retention and disposal procedures\n• Technical Measures - Monitoring for security breaches; Security features of software and applications; Regular testing and evaluation of security measures; Encryption, authentication, and access control procedures\n6. Breach and Security Incidents\n• Establish a Data Breach Response Team (DBRT)\n• Implement preventive and mitigation measures\n• Set procedures for data recovery and restoration\n• Establish a notification protocol\n• Maintain proper documentation and reporting of incidents and breaches\n7. Inquiries and Complaints\n8. Effectivity",
    "ratingGuide": "Rating 1 – Not Compliant:\nNo Privacy Manual or formal data protection policies exist. There is no guidance on security measures or evidence that privacy principles are being applied.\n\nRating 2 – Partially Compliant:\nPrivacy policies or a manual exist informally or partially, but they are incomplete or applied inconsistently.\n\nRating 3 – Substantially Compliant:\nA Privacy Manual or policies exist, covering most security measures, but implementation is inconsistent. Some areas, like PIAs, breach response, or training, may not be fully implemented or monitored.\n\nRating 4 – Fully Compliant:\nA comprehensive Privacy Manual or data protection policies are documented, implemented, and regularly reviewed and updated. Policies are applied in practice."
  },
  {
    "id": "q10",
    "row": 13,
    "component": "Program Controls",
    "subDomain": "Data Security",
    "domain": "Manage Security Risk",
    "controlQuestion": "Do you implement organizational, physical, and technical security measures to ensure the proper protection of all personal data?",
    "drlNo": 10,
    "proof": "Data center and storage areas with limited physical access\n\nReport on technical security measures and information security tools in place\n\nFirewalls implemented\n\nEncryption for data transmission and data storage\n\nAccess policy for onsite, remote, and online access\n\nAudit logs maintained\n\nBackup solutions in place\n\nReport of internal security audits or other internal assessments\n\nCertifications or accreditations (e.g., ISO 27001, NPC Privacy Mark)\n\nVulnerability assessments conducted\n\nPenetration testing for applications and network\n\nOther measures demonstrating compliance",
    "basis": "Basis: Sec. 25, IRR\n\nPersonal information controllers and personal information processors shall implement reasonable and appropriate organizational, physical, and technical security measures for the protection of personal data, taking into account the nature of the personal data to be protected, the risks presented by the processing, the size of the organization and complexity of its operations, current data privacy best practices, cost of security implementation, and the most appropriate standard recognized by the information and communications technology industry, as may be necessary.\n\nAs minimum, it must comply with the NPC Circular 2023-06.",
    "ratingGuide": "Rating 1 – Not Compliant:\nNo security measures (organizational, physical, or technical) are in place to protect personal data. Risks related to processing or data sensitivity are not addressed.\n\nRating 2 – Partially Compliant:\nSome security measures are in place informally, but there is no formal documentation or consistent application. There are gaps in protection, and only certain aspects of security are addressed.\n\nRating 3 – Substantially Compliant:\nDocumented security measures exist, covering organizational, physical, and technical safeguards, but implementation is inconsistent. Some measures (e.g., risk assessments, access controls, encryption, staff awareness) may be incomplete or not fully aligned with data risks or best practices.\n\nRating 4 – Fully Compliant:\nAll security measures (organizational, physical, and technical) are fully documented, implemented, and consistently applied. Measures are proportional to data sensitivity, processing risks, and industry standards. All controls are maintained to protect personal data from unauthorized access, alteration, or disclosure."
  },
  {
    "id": "q11",
    "row": 14,
    "component": "Program Controls",
    "subDomain": "Capacity Building",
    "domain": "Human Resources Management",
    "controlQuestion": "Do you regularly train personnel on privacy and security policies?",
    "drlNo": 11,
    "proof": "Number of employees who attended privacy and data protection training / Training Attendance Sheet \n\nCommitment to comply with the Data Privacy Act included in the Code of Conduct or a signed document filed in each employee’s record",
    "basis": "Basis: Sec. 26(d), IRR; NPC Circular 2023-06\n\nThere shall be capacity building, orientation or training programs for employees, agents or representatives, regarding privacy or security policies. \n\nPeriodically train employees, agents, personnel, or representatives on privacy and data protection policies.",
    "ratingGuide": "Rating 1 – Not Compliant:\nNo training or orientation on privacy or security policies. Personnel are unaware of data protection requirements.\n\nRating 2 – Partially Compliant:\nTraining is informal or irregular, with no formal schedule or documentation. Some personnel may have received privacy or security guidance, but it is not comprehensive or consistently delivered.\n\nRating 3 – Substantially Compliant:\nFormal, documented training programs exist, but participation is inconsistent. Some personnel may not have attended, or refresher training may be irregular or incomplete.\n\nRating 4 – Fully Compliant:\nRegular, documented training is provided for all employees, agents, and representatives. The training covers privacy, security policies, and data protection principles, and is consistently delivered, monitored, and updated according to legal requirements."
  },
  {
    "id": "q12",
    "row": 15,
    "component": "Program Controls",
    "subDomain": "Capacity Building",
    "domain": "Human Resources Management",
    "controlQuestion": "Do you require Non-Disclosure Agreements (NDAs) and issue Security Clearances for personnel handling personal data?",
    "drlNo": 12,
    "proof": "NDAs or confidentiality agreements\n\nSecurity Clearance Policy / Access Control Policy (may be in Privacy Manual)",
    "basis": "Basis: Sec. 26(d), IRR; NPC Circular 2023-06\n\nEmployees, agents, or representatives shall operate and hold personal data under strict confidentiality if the personal data are not intended for public disclosure. This obligation shall continue even after leaving the public service, transferring to another position, or upon terminating their employment or contractual relations.\n\nMust ensure that access to personal data is strictly regulated by issuing a security clearance or its equivalent only to its authorized personnel. A copy of the appropriate security clearance or its equivalent must be filed with its DPO. ",
    "ratingGuide": "Rating 1 – Not Compliant:\nNo evidence that personnel handling personal data sign NDAs or have security clearances. Access to personal data is unregulated, and confidentiality is not enforced.\n\nRating 2 – Partially Compliant:\nNDAs or security clearances are applied informally or inconsistently. Some personnel may have signed agreements, but documentation is incomplete or not consistently enforced.\n\nRating 3 – Substantially Compliant:\nNDAs and security clearances are documented and issued, but implementation is inconsistent. Some personnel may lack proper authorization, or updates and monitoring of confidentiality obligations are irregular.\n\nRating 4 – Fully Compliant:\nAll personnel handling personal data sign NDAs and are issued security clearances. Documentation is maintained with the DPO, access is strictly controlled, and confidentiality obligations are consistently enforced, even after employment or contract termination, in line with legal requirements."
  },
  {
    "id": "q13",
    "row": 16,
    "component": "Program Controls",
    "subDomain": "Capacity Building",
    "domain": "Human Resources Management",
    "controlQuestion": "Is there ongoing training and capacity building for the DPO, and does the DPO pursue certifications and membership in recognized DPO organizations?\n",
    "drlNo": 13,
    "proof": "Certificate of Training of DPO\n\nCertifications of DPOs",
    "basis": "Basis: NPC Privacy 3rd Toolkit p. 126-127\n\nThe Commission does not require certifications for key personnel. However, it is considered best practice across jurisdictions for organizations to properly equip their personnel with appropriate trainings that enable them to fulfill their specific roles and functions. \n\nSome international certifications or training commonly considered  for this purpose include the following \n-Certified Information Systems Auditor (CISA).\n-Certified Information Security Manager (CISM)\n-Certified in the Governance of Enterprise IT (CGEIT).\n-Certified Information Systems Security Professionals (CISSP)\n-GIAC Security Essentials (GSEC)\n-Project Management Professional (PMP)\n-Certified Information Privacy Manager (CIPM)\n-Certified Information Privacy Professional (CIPP)\n-Certified Information Privacy Technologist (CIPT)",
    "ratingGuide": "Rating 1 – Not Compliant:\nNo evidence of training or professional development for the DPO. The DPO does not pursue certifications or join recognized privacy/security organizations.\n\nRating 2 – Partially Compliant:\nThe DPO participates in some informal or ad-hoc training, but it is not systematic or documented. Pursuit of certifications or memberships is limited or inconsistent, with no formal plan for ongoing development.\n\nRating 3 – Substantially Compliant:\nOngoing training and capacity-building are documented and available to the DPO, but participation may be irregular. Some recommended certifications or memberships have not been pursued.\n\nRating 4 – Fully Compliant:\nThe DPO regularly participates in documented training and development programs, actively pursues relevant certifications (e.g., CISA, CISM, CIPM, CIPP), and joins recognized privacy/security organizations."
  },
  {
    "id": "q14",
    "row": 17,
    "component": "Program Controls",
    "subDomain": "Breach Management",
    "domain": "Data Breach Management",
    "controlQuestion": "Have you implemented safeguards to prevent or minimize personal data breaches?",
    "drlNo": 14,
    "proof": "Schedule of breach drills\n\nNumber of Trainings conducted \nfor internal personnel on breach \nmanagement\n\nPersonnel Order constituting the Data Breach Response Team\n\nIncident Response Policy and \nProcedure (may be in Privacy Manual)",
    "basis": "Basis: Sec. 26(d), IRR\n\nRegular monitoring for security breaches, and a process both for identifying and accessing reasonably foreseeable vulnerabilities in their computer networks, and for taking preventive, corrective, and mitigating action against security incidents that can lead to a personal data breach\n\nSecurity Incident Management Policy\nA Personal Information Controller (PIC) or Personal Information Processor (PIP) must have clear policies and procedures for managing security incidents, including personal data breaches. These must ensure:\nA. Establishment of a Data Breach Response Team with clearly defined roles to ensure timely action during a security incident or breach.\nB. Implementation of organizational, physical, and technical security measures to prevent or minimize data breaches and enable timely detection of security incidents.\nC. Adoption of an incident response procedure to contain breaches and restore system integrity.\nD. Mitigation measures to minimize harm and negative consequences to affected data subjects.\nE. Compliance with the Data Privacy Act, its IRR, and NPC issuances on breach notification.\n\nA Security Incident Management Policy must also include preventive safeguards to reduce the likelihood of data breaches, such as:\nA. Conducting Privacy Impact Assessments (PIAs) to identify risks in data processing, considering data sensitivity, potential harm, and impact of breaches.\nB. Establishing a Data Governance Policy to uphold transparency, legitimate purpose, and proportionality.\nC. Implementing security measures to protect the availability, integrity, and confidentiality of personal data.\nD. Performing regular monitoring, vulnerability scans, and breach detection on computer networks.\nE. Ensuring capacity building and training for personnel on data breach management and incident response procedures.\nF. Regularly reviewing, testing, and evaluating the effectiveness of security policies and procedures.",
    "ratingGuide": "Rating 1 – Not Compliant:\nNo safeguards or incident response processes for personal data breaches. No Security Incident Management Policy or Data Breach Response Team exists.\n\nRating 2 – Partially Compliant:\nSome informal or ad-hoc measures exist but are not consistently applied. No formal team or documented process for managing breaches.\n\nRating 3 – Substantially Compliant:\nA documented Security Incident Management Policy and safeguards exist, covering breach response and monitoring, but implementation is inconsistent. Some key elements may not be fully applied or maintained.\n\nRating 4 – Fully Compliant:\nComprehensive safeguards are in place to prevent or minimize personal data breaches. Policies are documented. Security controls are regularly tested, reviewed, and updated to ensure compliance and timely breach response."
  },
  {
    "id": "q15",
    "row": 18,
    "component": "Program Controls",
    "subDomain": "Breach Management",
    "domain": "Data Breach Management",
    "controlQuestion": "Do you document security incidents and personal data breaches, and comply with breach notification requirements?\n",
    "drlNo": 15,
    "proof": "Record of Security incidents and \npersonal data breaches, including notification for personal data breaches / Annual Security Incident Report (ASIR)",
    "basis": "Basis: NPC Circular 2023-06; NPC Breach Reporting\n\nAll security incidents and personal data breaches shall be documented through written reports, including those not covered by the notification requirements. For other security incidents not involving personal data, a report containing aggregated data shall constitute sufficient documentation.\n\nAn ASIR must be submitted to the NPC each year. It includes all security incidents and personal data breaches that occurred within the calendar year, even those not subject to mandatory notification.\nThe ASIR must contain:\n• The total number of incidents and breaches encountered; and\n• The classification of incidents based on their causes and whether they were mandatory, voluntary, or other security incidents.\n\nFollowing the launch of the Data Breach Notification Management System (DBNMS), all ASIRs must be submitted exclusively through the system. The deadline for submission of the ASIR for the previous calendar year is 31 March of the current year.",
    "ratingGuide": "Rating 1 – Not Compliant:\nNo documentation of security incidents or personal data breaches. The organization does not comply with ASIR submission or breach notification requirements. Incidents are unrecorded and unreported.\n\nRating 2 – Partially Compliant:\nSome incidents or breaches are documented, but records are incomplete or inconsistent. ASIRs may be missing required details, and breach notification requirements are only partially met.\n\nRating 3 – Substantially Compliant:\nIncidents and breaches are documented, and ASIRs are submitted, but there are gaps in classification, coverage, or timeliness. Some incidents may be missing.\n\nRating 4 – Fully Compliant:\nAll incidents and breaches are thoroughly documented, and ASIRs are submitted annually on time. Documentation is complete and accurate."
  },
  {
    "id": "q16",
    "row": 19,
    "component": "Program Controls",
    "subDomain": "Third-Party Management",
    "domain": "Manage Third Party Risks",
    "controlQuestion": "Do you execute Data Sharing Agreements and review or enter into contracts and other agreements for personal data transfers, including cross-border transfers, to ensure a comparable level of data protection, compliance with the DPA, and security of the transfers?",
    "drlNo": 16,
    "proof": "Data Sharing Agreements or a similar document\n\nModel Contractual Clauses for Cross-Border Transfers of Personal Data if applicable\n\nList of recipients of personal data (PIPs, other PICs, service providers, government agencies)",
    "basis": "Basis: NPC Circular No. 2020-03; NPC Advisory No. 2024 - 01\n\nContents of a Data Sharing Agreement\nA. Purpose and lawful basis\nB. Objectives\nC. Parties\nD. Term\nE. Operational details\nF. Security\nG. Data subjects’ rights\nH. Retention and Data Disposal\n\nRecord of data sharing arrangements. — should establish and maintain a record of its data sharing arrangements, including the following:\nA. Contact details of all parties, including their respective data protection officers;\nB. Legal bases for the data sharing arrangement/s;\nC. Copy of the DSA/s, if executed;\nD. Written, recorded, or electronic proof of the consent obtained from data subjects, where applicable; and\nE. Date and/or time consent was obtained and withdrawn, where applicable.",
    "ratingGuide": "Rating 1 – Not Compliant:\nNo agreements or records for personal data transfers. Transfers happen without safeguards or compliance with the DPA.\n\nRating 2 – Partially Compliant:\nSome agreements exist, but they’re informal or incomplete. Key details may be missing, and records are inconsistent.\n\nRating 3 – Substantially Compliant:\nMost agreements are documented with key details, but implementation and record-keeping are inconsistent. Some transfers lack full consent or security measures, and cross-border transfers may not ensure full data protection.\n\nRating 4 – Fully Compliant:\nAll transfers, including cross-border, have documented agreements covering all required details. Records are maintained, regularly reviewed, and fully comply with the DPA and relevant regulations."
  },
  {
    "id": "q17",
    "row": 20,
    "component": "Program Controls",
    "subDomain": "Third-Party Management",
    "domain": "Manage Third Party Risks",
    "controlQuestion": "Do you review or enter into outsourcing contracts with Personal Information Processors (PIPs) to ensure a comparable level of data protection and compliance with the DPA?",
    "drlNo": 17,
    "proof": "Data Outsourcing / Subcontracting Agreements or formal contracts or other legal acts",
    "basis": "Basis: Sec. 44, IRR\n\nContents of a Data Outsourcing/ Subcontracting Agreement\nA. The subject and duration of the processing;\nB. The nature and purpose of the processing;\nC. The type of personal data and categories of data subjects;\nD. The obligations and rights of the PIC; and\nE. The geographic location of processing under the subcontracting arrangement.\nF. The contract or legal act must also require the PIP to:\n• Process personal data only upon documented instructions from the PIC, including international transfers, unless authorized by law;\n• Impose confidentiality obligations on all personnel authorized to process personal data;\n• Implement appropriate security measures and comply with the DPA, its IRR, and NPC issuances;\n• Avoid engaging another processor without prior approval from the PIC, ensuring equivalent data protection obligations if subcontracting occurs;\n• Assist the PIC in responding to data subject requests;\n• Support the PIC’s compliance with the DPA, related laws, and NPC rules, considering the nature of processing;\n• Delete or return all personal data to the PIC upon completion of services, including deleting copies unless retention is legally authorized;\n• Provide all necessary information to demonstrate compliance and allow audits or inspections by the PIC or its authorized auditor; and\n• Inform the PIC immediately if any instruction appears to violate the DPA, its IRR, or NPC issuances.",
    "ratingGuide": "Rating 1 – Not Compliant:\nNo outsourcing agreements/contracts with PIPs, or existing contracts lack data protection, confidentiality, or DPA compliance provisions. No oversight or monitoring of PIPs.\n\nRating 2 – Partially Compliant:\nContracts with PIPs exist, but they are informal, incomplete, or inconsistently applied. Key elements are missing. Limited oversight and monitoring of PIP compliance.\n\nRating 3 – Substantially Compliant:\nOutsourcing agreements with PIPs are documented and cover most required elements, but implementation or monitoring is inconsistent. Some obligations may not be fully applied.\n\nRating 4 – Fully Compliant:\nAll outsourcing contracts with PIPs are documented, comprehensive, and consistently enforced. PIP activities are regularly monitored and reviewed."
  },
  {
    "id": "q18",
    "row": 21,
    "component": "Program Controls",
    "subDomain": "Communication",
    "domain": "Privacy and Data Protection in day to day Operations",
    "controlQuestion": "Where personal data is collected, do you provide clear and easily accessible Privacy Notices with the DPO’s contact details?",
    "drlNo": 18,
    "proof": "Privacy Notice on the website and/or within the organization (where personal data is collected) and CCTV Notice (if applicable)\n\nVisible announcement displaying the DPO’s contact details (e.g., on the website or in the Privacy Notice)\n",
    "basis": "Basis: Sec. 18, 34(2), IRR; NPC Advisory No. 2017-01; NPC Circular No. 2023 - 04; NPC Circular No. 2024 – 02\n\nPRIVACY NOTICE\nDefault format: Just-in-time and Layered Notices\n\nJust-in-time/Short Privacy Notice: \nAt a minimum, the following information must be clearly stated: \n(a) a description of the personal data to be processed; \n(b) the purpose, nature, extent, duration, and scope of processing based on consent; \n(c) the identity of the PIC; \n(d) the data subject’s rights and how these rights can be exercised.\n\nFull Privacy Notice:\nThe data subject must be informed about how their personal data is collected and processed, including its purpose, scope, risks, safeguards, and their rights. All information must be easy to access and written in clear, plain language. The Privacy Notice must include:\n(a) Description of the personal data collected;\n(b) Purpose of processing, including for marketing, profiling, or research;\n(c) Legal basis for processing, if not based on consent;\n(d) Scope and method of processing;\n(e) Recipients or possible recipients of the data;\n(f) Methods for automated access (if applicable), including the logic, purpose, and effects of such processing;\n(g) Identity and contact details of the personal data controller or representative;\n(h) Retention period of the personal data;\n(i) Risks and safeguards\n(j) Data subject rights, including access, correction, objection, and the right to file a complaint with the NPC.\n\nCCTV NOTICE\nThe requirements above must apply. In addition, PICs must ensure that CCTV notices comply with the following:\n(a) Information about the use of CCTV systems must be provided in the most suitable format and written in clear, plain, and concise language.\n(b) CCTV notices must be clearly visible and prominently displayed in appropriate areas, such as entry points or other conspicuous locations.\n(c) The nature, scope, and extent of surveillance, as well as the purpose, system capabilities, and other relevant details, must be disclosed to data subjects in line with their right to be informed under the DPA.\n\nDISPLAY OF DPO'S CONTACT DETAILS\nThe DPO’s contact details must be included in at least the following materials:\n a. Website\n b. Privacy Notice\n c. Privacy Policy\n d. Privacy Manual or Privacy Guide\n\nThe DPO’s contact details should include:\n a. Title or designation\n b. Postal address\n c. Dedicated telephone number\n d. Dedicated email address",
    "ratingGuide": "Rating 1 – Not Compliant:\nNo privacy notices are provided where personal data is collected, and DPO contact details are missing. Data subjects are not informed of how their data is processed or their rights.\n\nRating 2 – Partially Compliant:\nPrivacy notices are provided in some instances but may lack key information or be difficult to access. DPO contact details may be inconsistent, and notices may not cover all required elements.\n\nRating 3 – Substantially Compliant:\nPrivacy notices are documented and available, covering most required information. Some notices may be inconsistent or incomplete across collection points, and DPO contact details are included in some materials but not all.\n\nRating 4 – Fully Compliant:\nClear, accessible privacy notices are provided everywhere personal data is collected, covering all required elements. DPO contact details are consistently included across all required materials, written in plain and understandable language."
  },
  {
    "id": "q19",
    "row": 22,
    "component": "Program Controls",
    "subDomain": "Communication",
    "domain": "Privacy and Data Protection in day to day Operations",
    "controlQuestion": "If applicable, do you have a procedure for obtaining consent?",
    "drlNo": 19,
    "proof": "Procedures for obtaining consent and a Consent Form (may be included in Privacy Manual)",
    "basis": "Basis: NPC Circular No. 2023 - 04\n\nThe consent form must include all information required in a Privacy Notice and clearly state that consent is the lawful basis for processing. It should present the PIC’s proposal to the data subject, requesting their consent to process personal data under the terms stated in the form.",
    "ratingGuide": "Rating 1 – Not Compliant:\nNo procedure or consent forms exist. Personal data is processed without informing the data subject or obtaining lawful consent.\n\nRating 2 – Partially Compliant:\nA procedure or consent form exists but is informal, incomplete, or inconsistently applied. Required details from the Privacy Notice may be missing, or the form may not clearly state consent as the lawful basis.\n\nRating 3 – Substantially Compliant:\nA documented procedure exists, and forms generally include required information. Implementation is inconsistent, or some forms lack clarity on the lawful basis or processing terms.\n\nRating 4 – Fully Compliant:\nA formal, documented procedure for obtaining consent is in place. Consent forms include all required information and clearly state consent as the lawful basis. The procedure is consistently applied, ensuring proper data subject information and valid consent."
  },
  {
    "id": "q20",
    "row": 23,
    "component": "Program Controls",
    "subDomain": "Communication",
    "domain": "Privacy and Data Protection in day to day Operations",
    "controlQuestion": "Have you established procedures or a platform for data subjects to exercise their rights and to handle requests from third parties?",
    "drlNo": 20,
    "proof": "Form or platform for data subjects to exercise their rights, and a Request Form (may be included in the Privacy Manual / Privacy Notice)\n\nPolicies and procedures for handling requests for information from third parties (e.g., media, law enforcement, representatives), and a Request Form (may be included in the Privacy Manual/Privacy Notice)",
    "basis": "Basis: NPC Advisory No. 2021 - 01; NPC Circular No. 2024 – 02\n\nDATA SUBJECT REQUEST\n\nThe following should be considered:\n\nA. Request Form\n• No required standard form, but the process must be clear, simple, and convenient.\n• Data subjects must be informed of the process\n• May use a standard form but must still act on valid requests even without it.\n• Sample forms for access, rectification, and erasure (Annexes A, B, and C of NPC Advisory No. 2021 - 01 ) may be modified as needed\n\nB. Verification of Identity. \n• Must use reasonable measures to verify the requester’s identity and may require supporting documents.\n• For representatives, PICs may request proof of authorization and supporting documents.\n• For legal heirs or assigns, PICs may require: a) Death Certificate of the data subject; b) Birth Certificate of heirs or assigns; c) Other supporting documents to verify identity and authority\n• For organizations requesting on behalf of members, PICs may require proof of authorization, membership validation, and authority to represent affected data subjects.\n\nC. Assistance of PIPs\n• PICs must ensure that their PIPs cooperate in handling requests for data subject rights through contractual or other reasonable means.\n\nD. Fees and Charges\n• Should not charge fees for data subject rights requests.\n• Reasonable administrative fees may be charged for copies of personal data, but they must not discourage requests.\n\nE. Compliance Period\n• Must respond without undue delay, and no later than 30 working days from receipt of the request or necessary documentation.\n• For complex or numerous requests, an extension of up to 15 working days may be allowed, with written notice of the reason for delay.\n• Government agencies must comply with Republic Act No. 11032 (Ease of Doing Business Act) and its IRR.\n• For CCTV:  \n1. Viewing requests: must be completed within five (5) working days from receipt of the request.\n2. Requests for copies: must be completed within fifteen (15) working days from receipt of the request.\n3. Complex or involves multiple CCTV footage, may extend the processing period by up to fifteen (15) additional working days.\n\nA request is considered officially submitted once the requesting party has complied with all requirements. In case of an extension, the PIC or its PIP must notify the data subject or authorized representative in writing, stating the reason for the extension and the expected date of compliance.\n\nF. Retention\n• Must not retain personal data solely for future access or portability requests.\n• Data should only be retained for as long as necessary to fulfill its original purpose.\n\nTHIRD-PARTY REQUEST\n\nThe same policies and procedures for data subject requests shall apply. The following must be observed:\n\nA. Evaluation of Requests\n• Must assess each request based on the Data Privacy Act (DPA), its IRR, NPC issuances, and other applicable laws\n• Disclosure methods must be secure to ensure only the intended recipient can access the information\n\nB. Lawful Disclosure\n• Allowed only under the following conditions, in accordance with Sections 4, 12, and 13 of the DPA:",
    "ratingGuide": "Rating 1 – Not Compliant:\nNo procedures or platform for data subjects or third parties to exercise their rights. No processing, guidance, verification, or response mechanism.\n\nRating 2 – Partially Compliant:\nInformal or incomplete procedures. Requests may be inconsistent, with inadequate verification, missed timelines, or obstacles to submission. Third-party requests may not meet legal requirements.\n\nRating 3 – Substantially Compliant:\nDocumented procedures generally cover submission, verification, response times, and retention. Some aspects (e.g., complex requests or third-party coordination) may be inconsistently applied.\n\nRating 4 – Fully Compliant:\nComprehensive, consistent procedures or platforms are in place. Requests are processed with clear forms, identity checks, secure disclosure, and compliance with timelines and legal requirements."
  },
  {
    "id": "q21",
    "row": 24,
    "component": "Oversight and Continuous Improvement",
    "subDomain": "Oversight and Review Plan",
    "domain": "Continuing Assessment and Development",
    "controlQuestion": "Do you have policies and schedules in place for the regular review, assessment, and updating of your privacy and security practices?",
    "drlNo": 21,
    "proof": "Policy on conduct of Internal \nAssessments and Security Audits\n\nPrivacy Manual contains policy for regular review",
    "basis": "Basis: Sec. 26(b)(3), IRR\n\nThe polices shall provide for documentation, regular review, evaluation, and updating of the privacy and security policies and practices.",
    "ratingGuide": "Rating 1 – Not Compliant:\nNo policies or schedules for reviewing, assessing, or updating privacy and security practices. No formal documentation or outdated policies.\n\nRating 2 – Partially Compliant:\nPolicies exist but are not consistently reviewed or updated. Schedules are informal or irregular, and assessments or updates are not well documented.\n\nRating 3 – Substantially Compliant:\nPolicies and schedules for review and updates are documented but applied inconsistently. Some practices may not be evaluated regularly or fully updated.\n\nRating 4 – Fully Compliant:\nRegularly reviewed and updated policies with documented schedules. Reviews are systematic, findings are recorded, and updates are applied to keep practices effective."
  },
  {
    "id": "q22",
    "row": 25,
    "component": "Oversight and Continuous Improvement",
    "subDomain": "Assess and Revise Program Controls",
    "domain": "Continuing Assessment and Development",
    "controlQuestion": "Do you review and update forms, contracts, policies and procedures / Privacy Manual annually?",
    "drlNo": 22,
    "proof": "Proof of annual review and/or update of RoPA, DPS Inventory, PIA, Privacy Manual / privacy and security policies, PMP, Privacy Notice and Consent Forms, and Data Outsourcing and Sharing Agreements.",
    "basis": null,
    "ratingGuide": "Rating 1 – Not Compliant:\nNo regular reviews or updates of forms, contracts, policies, or the Privacy Manual. Outdated or inaccurate materials may be in use.\n\nRating 2 – Partially Compliant:\nOccasional reviews or updates, but no formal schedule. Updates may be inconsistent or limited to certain materials.\n\nRating 3 – Substantially Compliant:\nAnnual review and updates planned, but not fully implemented. Most documents are reviewed, but some may be overlooked or updates incomplete.\n\nRating 4 – Fully Compliant:\nAll forms, contracts, policies, and the Privacy Manual are reviewed and updated annually, with all updates fully applied and documented."
  },
  {
    "id": "q23",
    "row": 26,
    "component": "Oversight and Continuous Improvement",
    "subDomain": "Assess and Revise Program Controls",
    "domain": "Continuing Assessment and Development",
    "controlQuestion": "Is the PMP regularly assessed and revised based on the results of PIAs, implementation effectiveness, and current data privacy best practices?",
    "drlNo": 23,
    "proof": "PMP Compliance / Gap / Maturity Assessment",
    "basis": null,
    "ratingGuide": "Rating 1 – Not Compliant:\nThe PMP is not assessed or revised. PIAs, implementation effectiveness, or best practices are not considered.\n\nRating 2 – Partially Compliant:\nThe PMP is occasionally assessed, but revisions are informal or inconsistent. Feedback from PIAs and best practices may not be systematically applied.\n\nRating 3 – Substantially Compliant:\nThe PMP is assessed and revised based on PIAs and best practices, but updates may be incomplete or inconsistently documented.\n\nRating 4 – Fully Compliant:\nThe PMP is regularly assessed and revised, fully considering PIAs, implementation results, and current best practices. Updates are consistently applied and documented to ensure ongoing effectiveness and compliance."
  },
  {
    "id": "q24",
    "row": 27,
    "component": "Oversight and Continuous Improvement",
    "subDomain": "Assess and Revise Program Controls",
    "domain": "Manage Privacy Ecosystem",
    "controlQuestion": "Does the organization regularly monitor new technologies, emerging risks, data protection standards, and changes in laws and the ICT environment?\n",
    "drlNo": 24,
    "proof": "Number of trainings and conferences attended on privacy and data protection\n\nPolicy papers, legal or position papers, or research on emerging technologies, data privacy best practices, sector-specific standards, and international data protection standards",
    "basis": null,
    "ratingGuide": "Rating 1 – Not Compliant:\nThe organization does not monitor emerging technologies, risks, or legal changes. No processes are in place to stay current with developments.\n\nRating 2 – Partially Compliant:\nMonitoring is sporadic or informal. Updates on technologies, risks, or legal changes may be noted, but there’s no structured process, and coverage is inconsistent.\n\nRating 3 – Substantially Compliant:\nThere are documented processes for monitoring technologies, risks, and regulatory changes, but implementation may be inconsistent or not fully integrated into decision-making.\n\nRating 4 – Fully Compliant:\nThe organization systematically and regularly monitors emerging technologies, risks, data protection standards, and legal changes. Findings are documented and integrated into policies, controls, and privacy management practices to ensure compliance and mitigate risks."
  }
];

export const PRADAR_DOMAINS = [
  "Establish Data Privacy Governance",
  "Privacy Risk Assessment",
  "Maintain Organization Commitment",
  "Privacy and Data Protection in day to day Operations",
  "Manage Security Risk",
  "Data Breach Management",
  "Manage Third Party Risks",
  "Human Resources Management",
  "Continuing Assessment and Development",
  "Manage Privacy Ecosystem",
] as const;

export const DRL_STATUS_OPTIONS = ["Not Applicable", "Pending", "Provided", "Closed"] as const;
export const ASSESSMENT_STATUS_OPTIONS = ["Not started", "Ongoing", "Not Applicable", "Completed"] as const;
export const REVIEWER_STATUS_OPTIONS = ["Not started", "Ongoing", "Reviewed"] as const;
export const CLIENT_STATUS_OPTIONS = ["Not Started", "In Progress", "Accepted", "Rejected"] as const;
export const ASSESSOR_OPTIONS = ["Mhel Villar", "Elimar Pillos", "Rhona Ingalla", "Not Applicable"] as const;
export const REVIEWER_OPTIONS = ["Mon Carla Lagon", "Ilamae Palconit"] as const;
export const RATING_OPTIONS = [1, 2, 3, 4] as const;

export const RATING_LABELS: Record<number, string> = {
  1: "Not Compliant",
  2: "Partially Compliant",
  3: "Substantially Compliant",
  4: "Fully Compliant",
};

export const MATURITY_LABELS: Record<number, string> = {
  1: "Initial",
  2: "Commencing",
  3: "Developing",
  4: "Refining",
};
