export const ResumeStatus = {
  PENDING: 'PENDING',
  REVIEWING: 'REVIEWING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
} as const

export const RoleNameObject = {
  ADMIN: 'SUPER_ADMIN',
  USER: 'NORMAL_USER'
} as const

export const RoleName = ['SUPER_ADMIN', 'NORMAL_USER']
export type ResumeStatusType = (typeof ResumeStatus)[keyof typeof ResumeStatus]
