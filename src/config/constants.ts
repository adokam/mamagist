// App-wide constants. Values only, no logic.

// TODO: Choose the daily limit of messages a user can send to Debby.
export const DAILY_MESSAGE_CAP = 0;

// TODO: Set the Groq model name Debby uses.
export const GROQ_MODEL_NAME = "";

// MAX_PREGNANCY_WEEKS is used only for date checks (e.g. rejecting a last period
// date that would put a pregnancy past 44 weeks). Weekly content stops at week 42
// (weekly_content.week is limited to 1-42), so weeks 43-44 are valid dates with
// no new weekly content.
export const MAX_PREGNANCY_WEEKS = 44;

// Standard pregnancy length in days (40 weeks) from the last period date.
export const PREGNANCY_DAYS = 280;
