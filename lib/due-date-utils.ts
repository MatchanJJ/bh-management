/**
 * Utility functions for handling billing due dates
 */

export interface DueDateStatus {
  dueDate: Date
  daysUntilDue: number
  isPastDue: boolean
  isDueSoon: boolean // Within 3 days
  statusText: string
  statusColor: 'green' | 'yellow' | 'red' | 'gray'
}

/**
 * Get the due date for a given month and due day
 * @param month - Format: YYYY-MM
 * @param dueDay - Day of month (1-31)
 */
export function getDueDateForMonth(month: string, dueDay: number): Date {
  const [year, monthNum] = month.split('-').map(Number)
  const dueDate = new Date(year, monthNum - 1, dueDay)
  
  // Handle cases where due day doesn't exist in month (e.g., Feb 31)
  if (dueDate.getDate() !== dueDay) {
    // Set to last day of month
    dueDate.setDate(0)
  }
  
  return dueDate
}

/**
 * Calculate due date status for a billing
 * @param month - Format: YYYY-MM
 * @param dueDay - Day of month (1-31)
 * @param billingStatus - Current billing status
 */
export function calculateDueDateStatus(
  month: string,
  dueDay: number,
  billingStatus: 'PENDING' | 'PAID' | 'VERIFIED'
): DueDateStatus {
  const dueDate = getDueDateForMonth(month, dueDay)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  dueDate.setHours(0, 0, 0, 0)
  
  const diffTime = dueDate.getTime() - today.getTime()
  const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  const isPastDue = daysUntilDue < 0
  const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 3
  
  let statusText: string
  let statusColor: 'green' | 'yellow' | 'red' | 'gray'
  
  if (billingStatus === 'VERIFIED') {
    statusText = 'Paid & Verified'
    statusColor = 'green'
  } else if (billingStatus === 'PAID') {
    statusText = 'Payment Submitted'
    statusColor = 'green'
  } else if (isPastDue) {
    const daysPast = Math.abs(daysUntilDue)
    statusText = `Overdue by ${daysPast} day${daysPast !== 1 ? 's' : ''}`
    statusColor = 'red'
  } else if (isDueSoon) {
    statusText = daysUntilDue === 0 
      ? 'Due Today!' 
      : `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`
    statusColor = 'yellow'
  } else {
    statusText = `Due in ${daysUntilDue} days`
    statusColor = 'gray'
  }
  
  return {
    dueDate,
    daysUntilDue,
    isPastDue,
    isDueSoon,
    statusText,
    statusColor
  }
}

/**
 * Format due date for display
 */
export function formatDueDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
