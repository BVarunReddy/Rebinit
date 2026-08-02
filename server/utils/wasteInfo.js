// Static metadata per waste category — recyclability, hazard status, and
// plain-language disposal instructions. This is deliberately NOT part of
// the ML model: recyclability/hazard status is a property of the category
// itself, not something the CNN needs to learn. The model only predicts
// which of the 8 categories an image belongs to; this lookup attaches the
// practical "what do I actually do with this" info on top of that.

const WASTE_INFO = {
  paper: {
    recyclable: true,
    hazardous: false,
    disposal_tip: 'Keep it dry and flatten boxes. Place in your paper/cardboard recycling bin. Avoid recycling paper that\'s soiled with food or grease.',
  },
  plastic: {
    recyclable: true,
    hazardous: false,
    disposal_tip: 'Rinse out any food or liquid residue first. Check for a recycling number on the item — most municipal programs accept #1 and #2 plastics; check locally for others.',
  },
  organic: {
    recyclable: true,
    hazardous: false,
    disposal_tip: 'Compostable. Use a home compost bin if you have one, or your area\'s organic/wet-waste collection. Avoid mixing with plastic or packaging.',
  },
  glass: {
    recyclable: true,
    hazardous: false,
    disposal_tip: 'Rinse before recycling. Separate by color if your local program requires it. Handle broken glass carefully — wrap in paper before disposing if it\'s shattered.',
  },
  ewaste: {
    recyclable: true,
    hazardous: true,
    disposal_tip: 'Do NOT put this in regular trash or curbside recycling — it can leach toxic materials (lead, mercury, lithium). Take it to a certified e-waste collection point or battery drop-off location.',
  },
  metal: {
    recyclable: true,
    hazardous: false,
    disposal_tip: 'Rinse if it held food. Most scrap metal and cans can go to a metal recycling bin or scrap dealer — metal is one of the most valuable and reusable recyclables.',
  },
  textile: {
    recyclable: true,
    hazardous: false,
    disposal_tip: 'If still wearable, donate it. If too worn, look for a textile recycling drop-off — many are turned into insulation or industrial rags rather than sent to landfill.',
  },
  trash: {
    recyclable: false,
    hazardous: false,
    disposal_tip: 'This doesn\'t fit standard recycling streams. Dispose of it in general household waste. Consider whether a reusable alternative exists next time.',
  },
  unknown: {
    recyclable: null,
    hazardous: null,
    disposal_tip: 'Could not confidently classify this item. Try a clearer, closer photo with good lighting against a plain background.',
  },
};

function getWasteInfo(category) {
  return WASTE_INFO[category] || WASTE_INFO.unknown;
}

module.exports = { WASTE_INFO, getWasteInfo };
