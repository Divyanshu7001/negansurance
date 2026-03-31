"""Notification service stub."""

from __future__ import annotations

import logging

logger = logging.getLogger("negansurance.notifications")


class NotificationService:
    def send(self, channel: str, recipient: str, template: str, context: dict) -> None:
        logger.info(
            "notification_sent",
            extra={
                "channel": channel,
                "recipient": recipient,
                "template": template,
                "context": context,
            },
        )
