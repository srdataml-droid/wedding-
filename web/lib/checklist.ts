// A Nigerian wedding planning checklist. Item ids are stored in the couple's checklist,
// so never rename an id once it is live; change the label instead.

export type ChecklistGroup = { title: string; items: { id: string; label: string }[] };

export const CHECKLIST: ChecklistGroup[] = [
  {
    title: "A year or more before",
    items: [
      { id: "budget", label: "Agree a budget, and who is paying for what" },
      { id: "dates-families", label: "Agree the dates with both families" },
      { id: "guest-list-draft", label: "Draft the guest list with both families" },
      { id: "venues", label: "Book the venues for each ceremony" },
    ],
  },
  {
    title: "Nine months before",
    items: [
      { id: "introduction", label: "Plan the introduction" },
      { id: "photo-video", label: "Book a photographer and a videographer" },
      { id: "caterer", label: "Book the caterer" },
      { id: "decorator", label: "Book the decorator" },
      { id: "website", label: "Fill in your wedding website" },
    ],
  },
  {
    title: "Six months before",
    items: [
      { id: "aso-ebi-choose", label: "Choose the aso-ebi fabric and colours" },
      { id: "aso-ebi-share", label: "Tell guests how to order aso-ebi" },
      { id: "mc-dj", label: "Book the MC and the DJ or band" },
      { id: "cake", label: "Order the cake and the small chops" },
    ],
  },
  {
    title: "Three months before",
    items: [
      { id: "makeup-gele", label: "Book makeup and gele" },
      { id: "outfits", label: "Plan outfits for every ceremony" },
      { id: "invites", label: "Send invitations with your website link" },
      { id: "registry", label: "Book your court or registry date, if you need one" },
    ],
  },
  {
    title: "One month before",
    items: [
      { id: "confirm-vendors", label: "Confirm every vendor on WhatsApp" },
      { id: "chase-rsvps", label: "Chase guests who have not replied" },
      { id: "programme", label: "Plan the programme with your MC" },
      { id: "souvenirs", label: "Order souvenirs" },
    ],
  },
  {
    title: "The week of the wedding",
    items: [
      { id: "final-numbers", label: "Give the caterer your final numbers" },
      { id: "vendor-contacts", label: "Give a trusted friend every vendor's number" },
      { id: "pack", label: "Pack for each ceremony" },
    ],
  },
];

export const CHECKLIST_IDS = new Set(CHECKLIST.flatMap((g) => g.items.map((i) => i.id)));
export const CHECKLIST_TOTAL = CHECKLIST_IDS.size;
