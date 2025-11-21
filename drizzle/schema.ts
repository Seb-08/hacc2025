import { pgTable, pgSequence, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const riskLevel = pgEnum("risk_level", ['low', 'medium', 'high'])
export const snapshotStatus = pgEnum("snapshot_status", ['pending', 'approved', 'denied'])
export const status = pgEnum("status", ['open', 'closed'])
export const userRole = pgEnum("user_role", ['public', 'vendor', 'admin'])

export const appendixIdSeq = pgSequence("appendix_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "2147483647", cache: "1", cycle: false })
export const financialsIdSeq = pgSequence("financials_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "2147483647", cache: "1", cycle: false })
export const issuesIdSeq = pgSequence("issues_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "2147483647", cache: "1", cycle: false })
export const reportSnapshotsIdSeq = pgSequence("report_snapshots_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "2147483647", cache: "1", cycle: false })
export const reportsIdSeq = pgSequence("reports_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "2147483647", cache: "1", cycle: false })
export const scheduleScopeIdSeq = pgSequence("schedule_scope_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "2147483647", cache: "1", cycle: false })
export const usersIdSeq = pgSequence("users_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "2147483647", cache: "1", cycle: false })

