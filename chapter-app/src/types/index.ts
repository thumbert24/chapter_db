// ─── Enums ────────────────────────────────────────────────────────────────────
export type MembershipStatus = 'active' | 'inactive' | 'suspended' | 'deceased' | 'honorary' | 'life'
export type MembershipType   = 'graduate' | 'undergraduate_affiliate' | 'honorary' | 'life'
export type PaymentStatus    = 'paid' | 'partial' | 'outstanding' | 'waived' | 'deferred'
export type ComplianceStatus = 'current' | 'pending' | 'expired' | 'not_filed' | 'waived'
export type BgcResult        = 'clear' | 'flagged' | 'in_progress' | 'pending' | 'expired'
export type CertType         = 'imdp' | 'risk_management' | 'ritual_training' | 'other'
export type RoleType         = 'exec_board' | 'committee_chair' | 'committee_member' | 'appointed' | 'national' | 'regional'
export type EventType        = 'chapter_meeting' | 'community_service' | 'social' | 'fundraiser' | 'scholarship' | 'fraternal' | 'national' | 'other'
export type ApprovalStatus   = 'draft' | 'pending' | 'approved' | 'denied' | 'cancelled'
export type MeetingType      = 'regular' | 'special' | 'emergency' | 'executive' | 'retreat'
export type InterestLevel    = 'interested' | 'active_volunteer' | 'committee_member' | 'lead'
export type DocCategory      = 'constitution_bylaws' | 'financial_policy' | 'minutes' | 'calendar' | 'strategic_plan' | 'historical' | 'compliance' | 'operational' | 'other'
export type ChapterRole      = 'admin' | 'officer' | 'member'

// ─── Core Tables ──────────────────────────────────────────────────────────────
export interface Member {
  id: string
  first_name: string
  last_name: string
  preferred_name?: string
  member_number?: string
  email_primary: string
  email_secondary?: string
  phone_mobile?: string
  phone_home?: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  employer?: string
  occupation?: string
  linkedin_url?: string
  membership_status: MembershipStatus
  membership_type: MembershipType
  initiated_date?: string
  chapter_initiated?: string
  financial_standing: boolean
  voting_eligible: boolean
  email_bounced: boolean
  email_bounce_date?: string
  email_bounce_reason?: string
  created_at: string
  updated_at: string
}

export interface Education {
  id: string
  member_id: string
  institution: string
  degree?: string
  field_of_study?: string
  graduation_year?: number
  is_primary: boolean
  created_at: string
}

export interface DuesPayment {
  id: string
  member_id: string
  fiscal_year: string
  term?: string
  amount_owed: number
  amount_paid: number
  due_date?: string
  paid_date?: string
  payment_status: PaymentStatus
  payment_method?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface GrandTax {
  id: string
  member_id: string
  fiscal_year: string
  amount_owed: number
  amount_paid: number
  paid_date?: string
  payment_status: PaymentStatus
  confirmation_number?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Certification {
  id: string
  member_id: string
  cert_type: CertType
  completed_date?: string
  expiration_date?: string
  status: ComplianceStatus
  provider?: string
  certificate_number?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface BackgroundCheck {
  id: string
  member_id: string
  submitted_date?: string
  completed_date?: string
  expiration_date?: string
  status: ComplianceStatus
  result?: BgcResult
  provider?: string
  youth_eligible: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface LeadershipRole {
  id: string
  role_name: string
  role_type: RoleType
  committee_name?: string
  description?: string
  is_exec_board: boolean
  is_active: boolean
  created_at: string
}

export interface MemberRole {
  id: string
  member_id: string
  role_id: string
  term_year?: string
  start_date?: string
  end_date?: string
  is_current: boolean
  notes?: string
  created_at: string
  member?: Member
  role?: LeadershipRole
}

export interface ProgramInterest {
  id: string
  member_id: string
  program_name: string
  national_initiative?: string
  interest_level: InterestLevel
  is_active_volunteer: boolean
  enrolled_date?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  event_name: string
  event_type: EventType
  event_date: string
  end_date?: string
  location?: string
  description?: string
  requires_approval: boolean
  requires_insurance: boolean
  approval_status: ApprovalStatus
  approved_by?: string
  approved_date?: string
  insurance_filed: boolean
  insurance_filed_date?: string
  requires_bgc: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface EventAttendance {
  id: string
  event_id: string
  member_id: string
  registered: boolean
  attended?: boolean
  role?: string
  registered_at: string
  checked_in_at?: string
  notes?: string
  member?: Member
}

export interface MeetingAttendance {
  id: string
  member_id: string
  meeting_date: string
  meeting_type: MeetingType
  present: boolean
  excused: boolean
  late: boolean
  notes?: string
  created_at: string
  member?: Member
}

export interface Document {
  id: string
  title: string
  doc_category: DocCategory
  file_name?: string
  file_path?: string
  file_type?: string
  file_size_kb?: number
  version?: string
  effective_date?: string
  expiration_date?: string
  uploaded_by?: string
  is_current: boolean
  description?: string
  created_at: string
  updated_at: string
}

// ─── View Types ───────────────────────────────────────────────────────────────
export interface ComplianceSnapshot {
  id: string
  full_name: string
  email_primary: string
  financial_standing: boolean
  voting_eligible: boolean
  email_bounced: boolean
  imdp_status?: ComplianceStatus
  imdp_expires?: string
  risk_mgmt_status?: ComplianceStatus
  ritual_status?: ComplianceStatus
  bgc_result?: BgcResult
  bgc_expires?: string
  youth_eligible?: boolean
}

export interface LeadershipRosterRow {
  role_name: string
  role_type: RoleType
  committee_name?: string
  is_exec_board: boolean
  brother_name: string
  email_primary: string
  term_year?: string
  start_date?: string
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export interface DashboardStats {
  totalMembers: number
  financialMembers: number
  duesCollectionRate: number
  duesOutstanding: number
  bgcCurrent: number
  emailBounces: number
  complianceRates: {
    imdp: number
    riskMgmt: number
    ritual: number
    bgc: number
    grandTax: number
  }
}
