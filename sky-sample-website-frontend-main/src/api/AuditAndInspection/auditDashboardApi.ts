import axios from "axios";

export async function fetchAuditStatusCount(
  dateFrom: string,
  dateTo: string,
  division: string,
  auditType: string
) {
  const res = await axios.get(
    `api/audit-status-count/${dateFrom}/${dateTo}/${division}/${auditType}/status-count`
  );
  return res.data;
}

export async function fetchAuditScoreCount(
  dateFrom: string,
  dateTo: string,
  division: string,
  auditType: string
) {
  const res = await axios.get(
    `api/audit-status-count/${dateFrom}/${dateTo}/${division}/${auditType}/score-count`
  );
  return res.data;
}

export async function fetchAuditStatusCountByMonth(
  dateFrom: string,
  dateTo: string,
  division: string,
  auditType: string
) {
  const res = await axios.get(
    `api/audit-status-count/${dateFrom}/${dateTo}/${division}/${auditType}/status-count-by-month`
  );
  return res.data;
}

export async function fetchAuditAssignedCompletion(
  dateFrom: string,
  dateTo: string,
  division: string,
  auditType: string
) {
  const res = await axios.get(
    `api/audit-status-count/${dateFrom}/${dateTo}/${division}/${auditType}/assigned-completion`
  );
  return res.data;
}

export async function fetchAuditAssignedGradeStats(
  dateFrom: string,
  dateTo: string,
  division: string,
  auditType: string
) {
  console.log(auditType)
  const res = await axios.get(
    `api/audit-status-count/${dateFrom}/${dateTo}/${division}/External Audit/grade-stats`
  );
  return res.data;
}

export async function fetchAuditAnnouncementStats(
  dateFrom: string,
  dateTo: string,
  division: string,
  auditType: string
) {
  console.log(auditType)
  const res = await axios.get(
    `api/audit-status-count/${dateFrom}/${dateTo}/${division}/External Audit/announcement-stats`
  );
  return res.data;
}

export async function fetchAllDivisionTRecord(
  dateFrom: string,
  dateTo: string,
  division: string,
  auditType: string
) {
  console.log(division)
  const res = await axios.get(
    `api/audit-status-count/${dateFrom}/${dateTo}/${auditType}/all-division-record`
  );
  return res.data;
}

export async function fetchAuditCategoryBreakdown(
  dateFrom: string,
  dateTo: string,
  division: string,
  auditType: string
) {
  console.log(dateFrom)
  console.log(dateTo)
  const res = await axios.get(
    `api/audit-status-count/${division}/${auditType}/select-division-record`
  );
  return res.data;
}

export async function fetchAuditStandardsByDivision(
  dateFrom: string,
  dateTo: string,
  division: string,
  auditType: string
) {
  const res = await axios.get(
    `api/audit-status-count/${dateFrom}/${dateTo}/${division}/${auditType}/audit-standards`
  );
  return res.data;
}

export async function fetchAuditCompletionsByDivision(
  dateFrom: string,
  dateTo: string,
  division: string,
  auditType: string
) {
  const res = await axios.get(
    `api/audit-status-count/${dateFrom}/${dateTo}/${division}/${auditType}/audit-completion-draft`
  );
  return res.data;
}

export async function fetchAuditExpiryAction(
  dateFrom: string,
  dateTo: string,
  division: string,
  auditType: string
) {
  const res = await axios.get(
    `api/audit-status-count/${dateFrom}/${dateTo}/${division}/${auditType}/expiry-action`
  );
  return res.data;
}

export async function fetchAuditTypesByDivision(
  dateFrom: string,
  dateTo: string,
  division: string,
  auditType: string
) {
  const res = await axios.get(
    `api/audit-status-count/${dateFrom}/${dateTo}/${division}/${auditType}/audit-type`
  );
  return res.data;
}

export async function fetchAuditPriorityFindings(
  dateFrom: string,
  dateTo: string,
  division: string,
  auditType: string
) {
  const res = await axios.get(
    `api/audit-status-count/${dateFrom}/${dateTo}/${division}/category-priority-findings`
  );
  return res.data;
}

export async function fetchAuditScore(
  dateFrom: string,
  dateTo: string,
  division: string,
  auditType: string
) {
  const res = await axios.get(
    `api/audit-status-count/${dateFrom}/${dateTo}/${division}/category-score`
  );
  return res.data;
}

export async function fetchUpcomingAuditExpiry(
  dateFrom: string,
  dateTo: string,
  division: string,
  auditType: string
) {
  const res = await axios.get(
    `api/audit-status-count/${dateFrom}/${dateTo}/${division}/upcoming-expiry-audit`
  );
  return res.data;
}