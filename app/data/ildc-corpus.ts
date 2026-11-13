export interface ILDCCase {
  case_id: string
  title: string
  court: string
  date: string
  domain: string
  domain_label: string
  outcome: 'Allowed' | 'Dismissed' | 'Partly Allowed' | 'Remanded'
  split: 'train' | 'eval'
  citations: string[]
  statutes_cited: string[]
  facts: string
  arguments: string
  ruling: string
}

interface DomainSpec {
  domain: string
  label: string
  statutes: string[]
  anchor_citations: string[]
  motifs: string[]
  templates: Array<
    [
      string,
      string,
      string,
      string,
      'Allowed' | 'Dismissed' | 'Partly Allowed' | 'Remanded',
    ]
  >
}

const DOMAINS: DomainSpec[] = [
  {
    domain: 'contract_breach',
    label: 'Commercial & Contract Law',
    statutes: [
      'Indian Contract Act, 1872 - Section 73',
      'Indian Contract Act, 1872 - Section 74',
      'Specific Relief Act, 1963 - Section 10',
      'Specific Relief Act, 1963 - Section 16(c)',
      'Sale of Goods Act, 1930 - Section 55',
    ],
    anchor_citations: [
      'SC_1954_Satyabrata_Ghose_v_Mugneeram',
      'SC_1962_Fateh_Chand_v_Balkishan_Dass',
      'SC_1970_Maula_Bux_v_Union_of_India',
      'SC_2003_ONGC_v_Saw_Pipes',
      'SC_2015_Kailash_Nath_Associates_v_DDA',
    ],
    motifs: [
      'breach contract',
      'specific performance',
      'liquidated damages',
      'readiness willingness',
      'time essence',
      'consequential loss',
      'earnest money',
    ],
    templates: [
      [
        'Supply of Industrial Machinery & Delayed Delivery',
        'The appellant entered into a commercial supply contract for precision industrial goods and manufacturing equipment with stipulated delivery milestones. The respondent supplier failed to deliver the contracted machinery on time despite repeated reminders, causing production halts and quantifiable financial loss. The appellant seeks compensatory damages for breach of contract under Section 73 of the Indian Contract Act and specific performance of the supply obligation.',
        'Counsel for the appellant contended that readiness willingness to perform contractual obligations was continuously demonstrated, and that time essence was expressly stipulated in the purchase schedule. It was argued that breach contract by the respondent directly triggered consequential loss and entitled the appellant to both specific performance and liquidated damages without further proof of market differential.',
        'The Supreme Court held that where breach of contract causes direct and foreseeable loss in the ordinary course of business under Section 73 of the Indian Contract Act, the aggrieved buyer is entitled to compensatory damages. Because the appellant proved continuous readiness and willingness, the appeal is allowed with damages and interest.',
        'Allowed',
      ],
      [
        'Forfeiture of Earnest Money in Turnkey Procurement',
        'The appellant contracted to supply electrical transformers to the respondent utility board. Following raw material delays, delivery slipped by six weeks. The respondent terminated the agreement and forfeited the entire performance security and earnest money deposit without establishing actual loss. The appellant challenges the forfeiture and seeks refund with damages.',
        "The appellant submitted that under Section 74 of the Indian Contract Act, liquidated damages and forfeiture of earnest money cannot be enforced as a penalty in the absence of proven loss. Counsel emphasized that time essence was waived by the respondent's extensions and that breach contract did not occasion any actual pecuniary damage.",
        'Following Kailash Nath Associates v. DDA and Fateh Chand, proof of actual loss is a sine qua non under Section 74 where loss is capable of calculation. Arbitrary forfeiture of performance deposit is impermissible. The appeal is partly allowed, directing refund of the forfeited sum after deducting nominal administrative costs.',
        'Partly Allowed',
      ],
      [
        'Specific Performance of Commercial Raw Material Supply Agreement',
        'A long-term contract for supply of bauxite ore was repudiated mid-term by the respondent mining lessee after market prices surged. The appellant manufacturing plant sought specific performance and interim injunction, asserting that substitute goods were not readily available in the domestic market and failure to deliver on time crippled operations.',
        "Appellant's counsel urged that specific performance must be granted where damages are an inadequate remedy and the plaintiff has established readiness willingness throughout. Respondent countered that the contract was determinable and that liquidated damages under Section 73 and Section 74 adequately compensated any breach contract.",
        "Applying the amended Specific Relief Act, 1963 and Satyabrata Ghose, price escalation does not frustrate a commercial supply contract. The respondent's refusal to deliver goods on time constituted a deliberate breach of contract. Specific performance and damages for interim delay are decreed; appeal allowed.",
        'Allowed',
      ],
      [
        'Reciprocal Promises and Repudiation in Goods Delivery',
        'The appellant buyer alleged that the respondent failed to deliver raw cotton bales within the stipulated window, causing mill closure losses. However, the record disclosed that the appellant had failed to open the mandatory irrevocable letter of credit required prior to shipment.',
        'The appellant argued that non-delivery on the scheduled date automatically established breach contract and entitled it to consequential loss damages. The respondent demonstrated that opening the letter of credit was a condition precedent and the buyer lacked readiness willingness to pay.',
        'Under Sections 51 and 54 of the Indian Contract Act, when reciprocal promises are conditional, no claim for damages or specific performance lies when the claimant defaulted on the prior obligation. The appeal is dismissed.',
        'Dismissed',
      ],
    ],
  },
  {
    domain: 'criminal_appeal',
    label: 'Criminal Appellate Law (IPC Sec 302)',
    statutes: [
      'Indian Penal Code, 1860 - Section 302',
      'Indian Penal Code, 1860 - Section 201',
      'Indian Evidence Act, 1872 - Section 27',
      'Indian Evidence Act, 1872 - Section 106',
      'Code of Criminal Procedure, 1973 - Section 313',
    ],
    anchor_citations: [
      'SC_1952_Hanumant_v_State_of_MP',
      'SC_1984_Sharad_Birdhichand_Sarda_v_State_of_Maharashtra',
      'SC_1947_Pulukuri_Kottaya_v_King_Emperor',
      'SC_2010_Sanatan_Naskar_v_State_of_WB',
      'SC_2022_Ramanand_v_State_of_UP',
    ],
    motifs: [
      'circumstantial evidence',
      'chain circumstances',
      'reasonable doubt',
      'last seen',
      'section 302',
      'disclosure statement',
      'motive proved',
    ],
    templates: [
      [
        'Conviction Under Section 302 IPC on Incomplete Circumstantial Chain',
        'The accused was convicted under Section 302 IPC for murder based solely on circumstantial evidence, namely a last-seen witness examined twelve days after the incident and recovery of a blood-stained weapon from an open field accessible to the public. The appeal contends that the chain of circumstances was not complete and recovery was not proved beyond reasonable doubt.',
        'Learned counsel for the appellant argued that under the Panchsheel principles of circumstantial evidence, every link in the chain circumstances must be proved beyond reasonable doubt and must exclude every hypothesis of innocence. The recovery under Section 27 of the Evidence Act from an open place and delayed last seen testimony fail to sustain a conviction under section 302.',
        'Applying Sharad Birdhichand Sarda v. State of Maharashtra and Hanumant v. State of MP, suspicion however strong cannot take the place of proof beyond reasonable doubt. The chain of circumstances is broken and the Section 27 recovery lacks independent corroboration. Conviction under Section 302 IPC is set aside; appeal allowed.',
        'Allowed',
      ],
      [
        'Last Seen Together & Unexplained Custodial Homicide',
        'The appellant was convicted under Section 302 IPC for the homicidal death of his spouse inside the matrimonial home at night. Medical evidence established strangulation, and the appellant offered a false plea of alibi during examination under Section 313 CrPC while challenging the circumstantial evidence chain.',
        'The defence contended that circumstantial evidence was insufficient because no eyewitness saw the commission of the offence and motive proved was weak. The State argued that once homicidal death inside a locked room is proved, Section 106 of the Evidence Act places the burden on the inmate, and a false explanation completes the chain circumstances beyond reasonable doubt.',
        'Where an offence takes place inside the privacy of a house and last seen proximity is immediate, the accused must offer a cogent explanation under Section 106 of the Evidence Act. The chain of circumstances is complete and leaves no reasonable doubt. Appeal dismissed.',
        'Dismissed',
      ],
      [
        'Disputed Disclosure Statement & FSL Blood Group Mismatch',
        'The trial court and High Court convicted the appellant under Section 302 IPC relying on a disclosure statement under Section 27 of the Evidence Act and alleged motive arising from a village boundary dispute. The forensic report showed the blood on the recovered article was disintegrated and panch witnesses turned hostile.',
        'Counsel submitted that recovery was not proved beyond reasonable doubt as independent panch witnesses denied signing the seizure memo at the spot. Without forensic linkage or a complete chain circumstances, circumstantial evidence cannot sustain life imprisonment under section 302.',
        'Following Pulukuri Kottaya and Ramanand v. State of UP, a disclosure statement under Section 27 proved solely by the investigating officer without reliable panchnama or forensic matching is infirm. Because the chain of circumstances is incomplete, the appellant is acquitted giving benefit of reasonable doubt; appeal allowed.',
        'Allowed',
      ],
      [
        'Alteration of Conviction from Section 302 to Section 304 Part I IPC',
        'The accused was convicted under Section 302 IPC following a sudden altercation over irrigation water distribution in which a single blow with an agricultural implement proved fatal. Both circumstantial evidence and recovery of the implement were contested on appeal.',
        'The appellant urged that even if the recovery and presence at the spot were accepted, there was no premeditation and the case fell within Exception 4 to Section 300 IPC rather than section 302. Counsel also pointed to gaps in the chain circumstances regarding prior enmity.',
        'While recovery and involvement are proved beyond reasonable doubt, the occurrence transpired in a sudden fight without premeditation or undue advantage. Conviction is altered from Section 302 IPC to Section 304 Part I IPC and sentence reduced to ten years; appeal partly allowed.',
        'Partly Allowed',
      ],
    ],
  },
  {
    domain: 'land_acquisition',
    label: 'Land Acquisition & Fair Compensation (RFCTLARR Act)',
    statutes: [
      'Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 - Section 4',
      'Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 - Section 24(2)',
      'Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 - Section 26',
      'Land Acquisition Act, 1894 - Section 4',
      'Constitution of India - Article 300A',
    ],
    anchor_citations: [
      'SC_2014_Pune_Municipal_Corp_v_Harakchand_Misirimal_Solanki',
      'SC_2020_Indore_Development_Authority_v_Manoharlal',
      'SC_2012_Meher_Rusi_Dalal_v_Union_of_India',
      'SC_2022_K_Krishna_Reddy_v_Special_Dy_Collector',
      'SC_2024_Kolkata_Municipal_Corp_v_Bimal_Kumar_Shah',
    ],
    motifs: [
      'social impact',
      'impact assessment',
      'fair compensation',
      'public purpose',
      'agricultural land',
      'urgency clause',
      'solatium interest',
    ],
    templates: [
      [
        'Acquisition of Multi-Cropped Agricultural Land Without Social Impact Assessment',
        'The state acquired fertile agricultural land for a public industrial corridor project without conducting a proper social impact assessment under Section 4 of the Right to Fair Compensation Act, 2013. The landowners challenge the acquisition notifications as violating mandatory statutory safeguards and Article 300A.',
        'Counsel for the landowners contended that conducting a participatory social impact assessment with gram sabha consultation is a mandatory precondition before notifying agricultural land for acquisition. Bypassing the impact assessment without genuine urgency vitiates the entire proceeding under the fair compensation statute.',
        'Following Kolkata Municipal Corporation v. Bimal Kumar Shah, procedural safeguards under the Right to Fair Compensation Act, 2013 are integral to Article 300A. Acquiring agricultural land without a statutory social impact assessment is ultra vires. The impugned notifications are quashed; appeal allowed.',
        'Allowed',
      ],
      [
        'Enhancement of Market Value, Multiplier & 100% Solatium',
        "Landowners whose agricultural land was acquired for a national highway expansion challenged the collector's award for ignoring contemporaneous sale deeds of adjacent commercial plots and denying statutory solatium interest under the Right to Fair Compensation Act.",
        'The appellants argued that fair compensation requires adopting the highest bona fide exemplar sale deed with minimal development deduction, along with statutory multiplier and solatium interest. They further highlighted that no rehabilitation package followed the impact assessment.',
        'Under Section 26 and the First Schedule of the 2013 Act, landowners deprived of livelihood are entitled to highest exemplar market value plus 100% solatium and statutory interest. The matter is partly allowed enhancing compensation by 65% with full statutory benefits.',
        'Partly Allowed',
      ],
      [
        'Lapse Plea Under Section 24(2) When Possession Was Taken by Panchnama',
        'The appellants sought a declaration that acquisition of their peripheral agricultural land initiated under the 1894 Act had lapsed under Section 24(2) of the Right to Fair Compensation Act, 2013, alleging neither physical possession was taken nor fair compensation paid into their accounts.',
        'Appellants argued that deposit in the government treasury without tender to landowners violated the fair compensation mandate and required fresh acquisition with a social impact assessment. The State produced possession panchnamas and revenue mutation entries.',
        'Applying the Constitution Bench ruling in Indore Development Authority v. Manoharlal, lapse under Section 24(2) occurs only when both possession has not been taken AND compensation has not been paid. Because possession was validly taken, the acquisition does not lapse; appeal dismissed.',
        'Dismissed',
      ],
      [
        'Remand for Fresh Determination of Severance Damages & Rehabilitation',
        "A state irrigation project bisected the appellants' irrigated orchards, leaving unviable land fragments without access channels. The preliminary social impact assessment omitted severance damages, and the reference court mechanically affirmed the collector's baseline rate.",
        'Appellants submitted that the impact assessment and reference award completely overlooked statutory severance factors under Section 28 of the Right to Fair Compensation Act, depriving farmers of fair compensation for loss of access and standing fruit trees on agricultural land.',
        'The High Court erred in affirming an unreasoned reference order that ignored severance loss and tree valuation. The matter is remanded to the Reference Court for fresh computation within four months; appeal remanded.',
        'Remanded',
      ],
    ],
  },
  {
    domain: 'tax',
    label: 'Direct Taxation (Income Tax Act Sec 68)',
    statutes: [
      'Income Tax Act, 1961 - Section 68',
      'Income Tax Act, 1961 - Section 143(3)',
      'Income Tax Act, 1961 - Section 147',
      'Income Tax Act, 1961 - Section 260A',
      'Constitution of India - Article 265',
    ],
    anchor_citations: [
      'SC_1963_Kale_Khan_Mohamed_Hanif_v_CIT',
      'SC_1986_CIT_v_Orissa_Corporation_Pvt_Ltd',
      'SC_2007_CIT_v_Lovely_Exports_Pvt_Ltd',
      'SC_2019_PCIT_v_NRA_Iron_and_Steel_Pvt_Ltd',
      'SC_1958_Omar_Salay_Mohamed_Sait_v_CIT',
    ],
    motifs: [
      'section 68',
      'assessing officer',
      'creditworthiness genuineness',
      'unexplained cash',
      'explanations offered',
      'natural justice',
      'initial onus',
    ],
    templates: [
      [
        'Addition Under Section 68 Deleted Where Assessee Discharged Initial Onus',
        'The assessee challenged the addition made under Section 68 of the Income Tax Act in respect of share application money and unsecured loans on the ground that the documentary explanations offered—including PAN details, bank statements, audited balance sheets, and confirmations—were not properly considered by the assessing officer.',
        'Counsel for the assessee submitted that once identity of the creditor, creditworthiness genuineness of the banking transaction, and source of funds are placed on record, the initial onus under section 68 stands discharged. The assessing officer made the addition on mere surmise without issuing summons under Section 131 or disproving the explanations offered.',
        'Following CIT v. Orissa Corporation and CIT v. Lovely Exports, where the assessee furnishes complete identity and banking evidence and the assessing officer conducts no independent inquiry to rebut the explanations offered, the addition under Section 68 is unsustainable. Appeal allowed.',
        'Allowed',
      ],
      [
        'Bogus Share Capital Premium Through Shell Conduit Entities',
        'During scrutiny assessment under Section 143(3), the assessing officer added Rs. 14.5 crores under Section 68 of the Income Tax Act after field inquiries revealed that the subscriber companies had negligible taxable income, no physical office, and rotated funds through layered bank entries.',
        'The assessee contended that all subscriptions came through RTGS channels and the explanations offered with ROC filings satisfied section 68. The Revenue argued that mere paper identity does not establish creditworthiness genuineness when subscribers are shell conduits.',
        'Applying PCIT v. NRA Iron & Steel Pvt. Ltd., the assessee must prove not merely paper identity but real financial creditworthiness and commercial genuineness. The assessing officer rightly rejected the explanations offered after field verification. Appeal dismissed.',
        'Dismissed',
      ],
      [
        'Remand for Cross-Examination of Third-Party Statement Used Under Section 68',
        "An addition under Section 68 of the Income Tax Act was sustained against the assessee based on an ex-parte statement recorded during a third-party search, while the assessing officer refused the assessee's written request for cross-examination and ignored the explanations offered regarding trade advances.",
        'Counsel argued that relying on untested third-party statements while brushing aside documentary explanations offered by the assessee violated fundamental principles of natural justice. The assessing officer failed to supply the adverse material prior to passing the assessment order under section 68.',
        'In view of Omar Salay Mohamed Sait v. CIT and Andaman Timber Industries, failure to consider documentary explanations offered and denial of cross-examination vitiates the assessment finding. The order is set aside and remanded to the assessing officer for de novo adjudication; appeal remanded.',
        'Remanded',
      ],
      [
        'Partial Relief on Peak Credit Computation Under Section 68',
        'The assessee trader challenged cumulative additions made under Section 68 of the Income Tax Act for multiple cash deposits and withdrawals across the financial year, contending that the assessing officer ignored the explanations offered regarding recycling of trade realizations.',
        'The assessee argued that taxing every deposit separately without applying the peak credit principle resulted in double taxation, and that explanations offered for documented sales proceeds were arbitrarily rejected by the assessing officer under section 68.',
        'Where cash withdrawals and re-deposits are established in a running business account, only the peak unexplained cash credit can be brought to tax under Section 68 after verifying the explanations offered. Appeal partly allowed restricting the addition to the peak credit balance.',
        'Partly Allowed',
      ],
    ],
  },
  {
    domain: 'labour',
    label: 'Industrial & Labour Law (ID Act Sec 25F)',
    statutes: [
      'Industrial Disputes Act, 1947 - Section 25F',
      'Industrial Disputes Act, 1947 - Section 25B',
      'Industrial Disputes Act, 1947 - Section 2(oo)',
      'Industrial Disputes Act, 1947 - Section 11A',
      'Constitution of India - Article 226',
    ],
    anchor_citations: [
      'SC_1960_State_of_Bombay_v_Hospital_Mazdoor_Sabha',
      'SC_1976_State_Bank_of_India_v_N_Sundara_Money',
      'SC_2013_Deepali_Gundu_Surwase_v_Kranti_Junior_Adhyapak',
      'SC_2014_BSNL_v_Bhurumal',
      'SC_1990_Punjab_Land_Development_Corp_v_Presiding_Officer_Labour_Court',
    ],
    motifs: [
      'section 25f',
      'industrial disputes',
      'labour court',
      'continuous service',
      'back wages',
      'retrenchment compensation',
      'reinstatement continuity',
    ],
    templates: [
      [
        'Illegal Retrenchment Without Notice or Compensation Under Section 25F',
        "Workmen who had completed over 240 days of continuous service in a calendar year were retrenched by a manufacturing unit without following the mandatory procedure of one month's written notice and retrenchment compensation under Section 25F of the Industrial Disputes Act. The Labour Court's award directing reinstatement with back wages in their favour is challenged in this appeal.",
        'The employer argued that the workmen were engaged on intermittent project muster rolls and that automatic reinstatement with full back wages was unwarranted. Counsel for the workmen submitted that non-compliance with section 25f of the industrial disputes Act renders termination void ab initio, and the labour court rightly awarded reinstatement continuity after proving 240 days of continuous service.',
        "Following State of Bombay v. Hospital Mazdoor Sabha and Deepali Gundu Surwase, compliance with clauses (a) and (b) of Section 25F of the Industrial Disputes Act is a condition precedent to valid retrenchment. The Labour Court's finding of 240 days continuous service suffers from no perversity. The award in favour of the workmen is upheld; appeal allowed in favour of workmen.",
        'Allowed',
      ],
      [
        'Substitution of Lump-Sum Compensation in Lieu of Reinstatement for Daily Wagers',
        'Daily-rated technicians retrenched without Section 25F compliance obtained a Labour Court award of reinstatement after twelve years of litigation. The manufacturing unit appealed contending that the unit had modernized and the engagement was purely casual.',
        'Counsel submitted that while violation of section 25f of the industrial disputes Act was found by the labour court, mechanical reinstatement continuity after a decade for daily-wage employees runs contrary to recent jurisprudence, and lump-sum retrenchment compensation should be moulded instead of full back wages.',
        'Applying BSNL v. Bhurumal, although termination violated Section 25F of the Industrial Disputes Act due to non-payment of retrenchment compensation after continuous service, where daily wagers were terminated over a decade ago, lump-sum compensation of Rs. 5,00,000 per workman serves justice better than reinstatement. Appeal partly allowed.',
        'Partly Allowed',
      ],
      [
        'Termination Under Fixed-Term Contract Excluded by Section 2(oo)(bb)',
        'Claimants engaged for a specific six-month seasonal packaging contract raised an industrial dispute alleging illegal retrenchment under Section 25F of the Industrial Disputes Act when their contract was not renewed upon expiry.',
        'Workmen urged before the labour court that they had worked overtime equivalent to continuous service and were entitled to section 25f retrenchment compensation and back wages. Management demonstrated bona fide fixed-term appointment letters governed by Section 2(oo)(bb) of the industrial disputes Act.',
        'Under Punjab Land Development Corp and Section 2(oo)(bb) of the Industrial Disputes Act, non-renewal of a genuine fixed-term contract upon its expiry does not constitute retrenchment requiring Section 25F compliance. Appeal dismissed.',
        'Dismissed',
      ],
      [
        'Remand to Labour Court for Production of Attendance & ESI Registers',
        'Retrenched machine operators asserted they had worked continuously for three years without Section 25F notice, whereas the employer withheld statutory muster rolls and ESI contribution ledgers. The Labour Court rejected the reference solely because the workmen only had gate passes.',
        'Counsel for the workmen contended that once a workman steps into the witness box and calls upon management to produce attendance records, the onus shifts; dismissing the claim under section 25f of the industrial disputes Act without drawing an adverse inference by the labour court regarding continuous service was illegal.',
        'The Labour Court erred in placing an impossible documentary burden on workmen when the employer possessed the statutory muster and ESI registers. The award is set aside and remanded to the Labour Court for fresh adjudication within three months; appeal remanded.',
        'Remanded',
      ],
    ],
  },
  {
    domain: 'constitutional_writ',
    label: 'Constitutional & Administrative Law (Art 14 & 226)',
    statutes: [
      'Constitution of India - Article 14',
      'Constitution of India - Article 19(1)(g)',
      'Constitution of India - Article 21',
      'Constitution of India - Article 226',
    ],
    anchor_citations: [
      'SC_1974_EP_Royappa_v_State_of_Tamil_Nadu',
      'SC_1978_Maneka_Gandhi_v_Union_of_India',
      'SC_1979_Ramana_Dayaram_Shetty_v_IAAI',
      'SC_1994_Tata_Cellular_v_Union_of_India',
      'SC_2014_Gorkha_Security_Services_v_Govt_of_NCT_of_Delhi',
    ],
    motifs: [
      'natural justice',
      'show cause',
      'arbitrary action',
      'article 14',
      'judicial review',
      'blacklisting order',
      'proportionality test',
    ],
    templates: [
      [
        'Quashing of Permanent Blacklisting Order Passed Without Show Cause Notice',
        'A government department blacklisted the appellant infrastructure contractor indefinitely without issuing a specific show cause notice proposing blacklisting, thereby barring the contractor from all public tenders.',
        'The appellant contended that blacklisting visits a person with civil death and cannot be imposed without a clear show cause notice complying with natural justice. Such arbitrary action violates article 14 and attracts judicial review under Article 226.',
        'Following Gorkha Security Services and Erusian Equipment, a blacklisting order must be preceded by a notice explicitly stating the proposed penalty, and permanent debarment fails the proportionality test under Article 14. The order is quashed; appeal allowed.',
        'Allowed',
      ],
      [
        'Judicial Review of Technical Bid Rejection in Public Procurement',
        'The petitioner challenged the rejection of its technical bid in a highway tender under Article 226, alleging that the tender evaluation committee applied an overly strict interpretation of turnover experience.',
        'Petitioner argued that rejection of its bid constituted arbitrary action under article 14 and warranted judicial review. The tendering authority demonstrated uniform application of essential eligibility criteria across all bidders after issuing a show cause clarification.',
        'Applying Tata Cellular v. Union of India, constitutional courts exercising judicial review under Article 226 examine the decision-making process, not the merits of technical tender conditions, unless mala fides or perversity are shown. Appeal dismissed.',
        'Dismissed',
      ],
    ],
  },
  {
    domain: 'arbitration',
    label: 'Arbitration & Conciliation Act (Sec 34 & 37)',
    statutes: [
      'Arbitration and Conciliation Act, 1996 - Section 34',
      'Arbitration and Conciliation Act, 1996 - Section 37',
      'Arbitration and Conciliation Act, 1996 - Section 28(3)',
      'Arbitration and Conciliation Act, 1996 - Section 31(7)',
    ],
    anchor_citations: [
      'SC_2014_Associate_Builders_v_DDA',
      'SC_2019_Ssangyong_Engineering_v_NHAI',
      'SC_2021_Project_Director_NHAI_v_M_Hakeem',
      'SC_2022_Delhi_Airport_Metro_Express_v_DMRC',
    ],
    motifs: [
      'patent illegality',
      'public policy',
      'section 34',
      'arbitral award',
      'reappreciation evidence',
      'plausible view',
    ],
    templates: [
      [
        'Impermissibility of Modifying or Reappreciating Evidence Under Section 34',
        'An arbitral tribunal awarded prolongation costs to an engineering contractor based on contemporaneous site diaries. In a petition under Section 34 of the Arbitration Act, the High Court re-weighed the oral evidence and modified the interest rate and quantum.',
        'The appellant contended that under section 34, a court cannot sit as a regular first appellate court or engage in reappreciation evidence when the arbitral award adopts a plausible view of the contract. Moreover, modification of an award is beyond Section 34 jurisdiction.',
        'Following Ssangyong Engineering v. NHAI and Project Director NHAI v. M. Hakeem, construction of contract terms is within the domain of the arbitrator and Section 34 does not empower courts to modify an arbitral award or reappreciate evidence. Appeal allowed; arbitral award restored.',
        'Allowed',
      ],
      [
        'Setting Aside Arbitral Award Vitiated by Patent Illegality & Rewriting Contract',
        'An arbitral tribunal awarded escalation claims explicitly barred by a firm-price clause in the construction agreement without recording reasons. The respondent challenged the award under Section 34 on the ground of patent illegality.',
        'Respondent argued that ignoring an express negative covenant in the contract amounts to rewriting the bargain and constitutes patent illegality on the face of the arbitral award under section 34 and Section 28(3).',
        'Where an arbitrator awards a claim in the teeth of an unambiguous contractual prohibition, the award suffers from patent illegality under Section 34(2A). Setting aside the award is affirmed; appeal dismissed.',
        'Dismissed',
      ],
    ],
  },
  {
    domain: 'insolvency_ibc',
    label: 'Insolvency & Bankruptcy Code (IBC Sec 7 & 9)',
    statutes: [
      'Insolvency and Bankruptcy Code, 2016 - Section 7',
      'Insolvency and Bankruptcy Code, 2016 - Section 8',
      'Insolvency and Bankruptcy Code, 2016 - Section 9',
      'Insolvency and Bankruptcy Code, 2016 - Section 30(2)',
    ],
    anchor_citations: [
      'SC_2017_Mobilox_Innovations_v_Kirusa_Software',
      'SC_2018_Innoventive_Industries_v_ICICI_Bank',
      'SC_2019_Committee_of_Creditors_of_Essar_Steel_v_Satish_Kumar_Gupta',
      'SC_2022_Vidarbha_Industries_Power_v_Axis_Bank',
    ],
    motifs: [
      'pre-existing dispute',
      'operational creditor',
      'financial debt',
      'commercial wisdom',
      'corporate debtor',
      'demand notice',
    ],
    templates: [
      [
        'Rejection of Section 9 IBC Petition Due to Pre-Existing Dispute',
        'An operational creditor issued a demand notice under Section 8 of the IBC and filed a Section 9 insolvency petition against the corporate debtor. Prior to the demand notice, the corporate debtor had sent three contemporaneous emails raising serious quality defects in the supplied components.',
        'The corporate debtor submitted that a plausible pre-existing dispute existed long before the Section 8 demand notice, barring admission of the operational creditor petition under Section 9 of the Code.',
        'Applying Mobilox Innovations v. Kirusa Software, once the corporate debtor demonstrates a genuine pre-existing dispute prior to the demand notice that is not patently feeble, the NCLT must reject the Section 9 application. Appeal allowed.',
        'Allowed',
      ],
      [
        'Non-Interference With Commercial Wisdom of Committee of Creditors',
        'Dissenting operational creditors challenged an approved resolution plan under Section 30(2) of the IBC, seeking parity in haircut percentages with secured financial creditors.',
        'Appellants argued that differential payment violated equitable distribution. The Resolution Professional submitted that commercial wisdom of the Committee of Creditors is paramount once minimum liquidation value under Section 30(2) is protected for the corporate debtor.',
        'Following Essar Steel v. Satish Kumar Gupta, judicial review of a resolution plan does not extend to overriding the commercial wisdom of the Committee of Creditors when statutory requirements of Section 30(2) are met. Appeal dismissed.',
        'Dismissed',
      ],
    ],
  },
]

const COURTS = [
  'Supreme Court of India',
  'Supreme Court of India',
  'Supreme Court of India',
  'High Court of Delhi',
  'High Court of Bombay',
  'High Court of Madras',
  'High Court of Karnataka',
]

function buildCanonicalCorpus(): ILDCCase[] {
  const cases: ILDCCase[] = []
  let idxCounter = 1
  for (let dIdx = 0; dIdx < DOMAINS.length; dIdx++) {
    const dom = DOMAINS[dIdx]
    const templates = dom.templates
    const nForDomain = dIdx < 5 ? 10 : 5
    for (let i = 0; i < nForDomain; i++) {
      const [tplTitle, tplFacts, tplArgs, tplRuling, tplOutcome] =
        templates[i % templates.length]
      const year = 2014 + ((idxCounter * 3 + i) % 12)
      const month = ((idxCounter + i * 2) % 12) + 1
      const day = ((idxCounter * 5 + i) % 27) + 1
      const caseId = `ILDC_${year}_${String(idxCounter).padStart(4, '0')}`
      const court = COURTS[(idxCounter + i) % COURTS.length]

      const anchors = dom.anchor_citations
      const cited = [
        anchors[0],
        anchors[(i % (anchors.length - 1)) + 1],
        anchors[((i + 1) % (anchors.length - 1)) + 1],
      ]
      if (i >= 2 && cases.length > 0) {
        const prevCaseId = cases[cases.length - 1].case_id
        if (!cited.includes(prevCaseId)) {
          cited.push(prevCaseId)
        }
      }

      const statutes =
        i % 2 === 0 ? dom.statutes.slice(0, 3) : dom.statutes.slice(1, 4)
      const split: 'train' | 'eval' = i % 4 === 3 ? 'eval' : 'train'
      const mm = String(month).padStart(2, '0')
      const dd = String(day).padStart(2, '0')

      const factsText = `[Civil/Criminal Appellate Jurisdiction — ${court}, Decided on ${year}-${mm}-${dd}] Matter Ref: ${tplTitle} (Batch Appeal No. ${1100 + idxCounter}/${year}). ${tplFacts} The record encompasses documentary exhibits Ex.P-1 to Ex.P-${8 + (i % 9)}, statutory notices under ${statutes.slice(0, 2).join(', ')}, and lower forum findings dated ${year - 2}.`
      const argsText = `${tplArgs} Reliance was specifically placed on the binding ratio in ${cited.slice(0, 2).join(', ')} and statutory provisions of ${statutes.join(', ')}. Key forensic motifs advanced included ${dom.motifs[0]}, ${dom.motifs[1]}, and ${dom.motifs[(i + 2) % dom.motifs.length]}.`
      const rulingText = `PER COURT: Having examined the record and precedents cited (${cited.slice(0, 3).join(', ')}), ${tplRuling} Final Order: The petition/appeal is accordingly disposed of as ${tplOutcome.toUpperCase()}.`

      cases.push({
        case_id: caseId,
        title: `${tplTitle} (#${i + 1})`,
        court,
        date: `${year}-${mm}-${dd}`,
        domain: dom.domain,
        domain_label: dom.label,
        outcome: tplOutcome,
        split,
        citations: cited,
        statutes_cited: statutes,
        facts: factsText,
        arguments: argsText,
        ruling: rulingText,
      })
      idxCounter++
    }
  }
  return cases
}

export const ILDC_CORPUS: ILDCCase[] = buildCanonicalCorpus()
