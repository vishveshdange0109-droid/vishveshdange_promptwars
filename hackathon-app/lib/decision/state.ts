export interface DecisionState {
  decision: string;
  goal: string;
  knownFacts: string[];
  assumptions: string[];
  evidence: string[];
  consequences: string[];
  secondOrderEffects: string[];
  tradeoffs: string[];
  risks: string[];
  unknowns: string[];
  exploredDimensions: string[];
  unexploredDimensions: string[];
}

export const ALL_DIMENSIONS = [
  "motivation",
  "assumptions",
  "facts",
  "risks",
  "tradeoffs",
  "second_order",
  "reversibility",
  "opportunity_cost",
  "financial",
  "emotion",
  "unknowns",
];

export function createInitialDecisionState(
  decisionStatement: string,
  statedGoal: string,
  initialFacts: string[] = []
): DecisionState {
  return {
    decision: decisionStatement,
    goal: statedGoal || "Make an informed choice",
    knownFacts: initialFacts,
    assumptions: [],
    evidence: [],
    consequences: [],
    secondOrderEffects: [],
    tradeoffs: [],
    risks: [],
    unknowns: [],
    exploredDimensions: [],
    unexploredDimensions: [...ALL_DIMENSIONS],
  };
}

export function mergeDecisionState(
  current: DecisionState,
  update: {
    knownFacts?: string[];
    assumptions?: string[];
    risks?: string[];
    unknowns?: string[];
    exploredDimensions?: string[];
  },
  actionCategory?: string
): DecisionState {
  const normalize = (arr: string[] = []) =>
    Array.from(new Set(arr.map((s) => s.trim()).filter(Boolean)));

  const newFacts = normalize([...current.knownFacts, ...(update.knownFacts || [])]);
  const newAssumptions = normalize([
    ...current.assumptions,
    ...(update.assumptions || []),
  ]);
  const newRisks = normalize([...current.risks, ...(update.risks || [])]);
  const newUnknowns = normalize([
    ...current.unknowns,
    ...(update.unknowns || []),
  ]);

  const newExplored = new Set(current.exploredDimensions);
  if (update.exploredDimensions) {
    update.exploredDimensions.forEach((d) => newExplored.add(d.toLowerCase()));
  }
  if (actionCategory) {
    newExplored.add(actionCategory.toLowerCase());
  }

  const exploredArr = Array.from(newExplored);
  const remainingUnexplored = ALL_DIMENSIONS.filter(
    (dim) => !exploredArr.includes(dim.toLowerCase())
  );

  return {
    ...current,
    knownFacts: newFacts,
    assumptions: newAssumptions,
    risks: newRisks,
    unknowns: newUnknowns,
    exploredDimensions: exploredArr,
    unexploredDimensions: remainingUnexplored,
  };
}
