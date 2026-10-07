import { psalm46 } from "./scripture/psalm46"

export type TodaysPathway = {
  label: string
  dateLabel: string
  category: string
  title: string
  scriptureReference: string
  scriptureTranslation?: string
  scriptureText?: string
  reflection: string
  prayer: string
}

const psalm46Verse10 = psalm46.verses.find((verse) => verse.verse === 10)

export const todaysPathway: TodaysPathway = {
  label: "TODAY'S PATHWAY",
  dateLabel: "October 7, 2026",
  category: "Daily Reflection",
  title: "Be still and know",
  scriptureReference: "Psalm 46:10",
  scriptureTranslation: psalm46.translation,
  scriptureText: psalm46Verse10?.text ?? "",
  reflection:
    "A quiet moment with God can change the way we see the day. Before we rush into the next task, we can pause, listen, and remember that God is present.",
  prayer:
    "Lord, help me to be still, listen to You, and walk through this day with a quiet heart.",
}
