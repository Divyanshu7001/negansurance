"""Simple graph analytics for entity link analysis."""

from __future__ import annotations

from collections import defaultdict
from typing import DefaultDict, Dict, Iterable, List, Set, Tuple

from .models import EvaluationContext


class InteractionGraph:
    """Tracks relationships between partners, devices, payouts, and zones."""

    def __init__(self) -> None:
        self._adjacency: DefaultDict[str, Dict[str, float]] = defaultdict(dict)
        self._flagged_entities: Set[str] = set()

    def connect(self, a: str, b: str, weight: float = 1.0) -> None:
        self._adjacency[a][b] = weight
        self._adjacency[b][a] = weight

    def mark_flagged(self, entity_id: str) -> None:
        self._flagged_entities.add(entity_id)

    def ingest_relationships(
        self, entity_ids: Iterable[str], flag_ring: bool = False
    ) -> None:
        entity_ids = list(entity_ids)
        for i, src in enumerate(entity_ids):
            for dst in entity_ids[i + 1 :]:
                self.connect(src, dst)
        if flag_ring:
            for entity in entity_ids:
                self.mark_flagged(entity)

    def score_claim(self, context: EvaluationContext) -> Tuple[float, List[str]]:
        nodes = [
            f"partner:{context.partner.partner_id}",
            f"device:{context.claim.device_id}",
            f"payout:{context.claim.payout_handle}",
        ]
        exposures: List[str] = []
        score = 0.0
        for node in nodes:
            neighbors = self._adjacency.get(node, {})
            degree = len(neighbors)
            if degree >= 6:
                bump = min((degree - 5) * 0.05, 0.4)
                score += bump
                exposures.append(f"High degree {node} ({degree})")
            flagged = self._flagged_entities.intersection(neighbors.keys())
            if flagged:
                score += 0.3 + 0.05 * (len(flagged) - 1)
                exposures.append(f"Linked to flagged entities: {', '.join(sorted(flagged))}")

        shared_devices = set(context.linked_device_ids)
        if shared_devices:
            score += min(len(shared_devices) * 0.05, 0.25)
            exposures.append("Device overlap with other partners")

        shared_payouts = set(context.linked_payout_handles)
        if shared_payouts:
            score += min(len(shared_payouts) * 0.05, 0.35)
            exposures.append("Payout overlap with other partners")

        return min(score, 1.0), exposures
