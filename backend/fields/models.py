from django.db import models
from django.conf import settings


# ---------------------------------------------------------------------------
# Fix 5 — STAGE_CHOICES defined ONCE, shared by both models
# ---------------------------------------------------------------------------

STAGE_CHOICES = (
    ('planted',   'Planted'),
    ('growing',   'Growing'),
    ('ready',     'Ready'),
    ('harvested', 'Harvested'),
)


# ---------------------------------------------------------------------------
# Fix 4 — Custom QuerySet: data-access scoping centralised on the model
# ---------------------------------------------------------------------------

class FieldQuerySet(models.QuerySet):
    """
    Custom queryset that encapsulates role-based visibility rules.

    Usage:
        Field.objects.visible_to(request.user)

    Having this on the model means every caller (views, management commands,
    signals, tests) automatically gets the same filtering — no duplication.
    """

    def visible_to(self, user):
        """
        Admins and superusers see every field; agents only see the fields
        assigned to them.
        """
        if not user or not user.is_authenticated:
            return self.none()
            
        if user.is_superuser or getattr(user, 'role', None) == 'admin':
            return self
            
        return self.filter(assigned_agent_id=user.id)


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class Field(models.Model):

    name         = models.CharField(max_length=255)
    crop_type    = models.CharField(max_length=100)
    planting_date = models.DateField()
    stage        = models.CharField(max_length=20, choices=STAGE_CHOICES, default='planted')

    assigned_agent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_fields',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_fields',
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Attach the custom QuerySet as the default manager
    objects = FieldQuerySet.as_manager()

    @property
    def status(self):
        """Derive a high-level status from the crop type and planting age."""
        if self.stage == 'harvested':
            return 'completed'
        from django.utils import timezone
        days  = (timezone.now().date() - self.planting_date).days
        limits = {'maize': 90, 'wheat': 120, 'rice': 150, 'beans': 60}
        limit = limits.get(self.crop_type.lower(), 90)
        return 'at_risk' if days > limit else 'active'

    def __str__(self):
        return f"{self.name} ({self.crop_type})"


class FieldUpdate(models.Model):

    field = models.ForeignKey(Field, on_delete=models.CASCADE, related_name='updates')
    agent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='field_updates',
    )
    stage    = models.CharField(max_length=20, choices=STAGE_CHOICES)
    notes    = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        """
        Fix 1 — Stage-sync business rule lives on the model, not the view.

        After any FieldUpdate is saved the parent Field's stage is automatically
        kept in sync. This guarantee holds regardless of which code path
        (API, admin, management command, signal) creates the update.
        """
        super().save(*args, **kwargs)
        if self.stage and self.field.stage != self.stage:
            self.field.stage = self.stage
            self.field.save(update_fields=['stage', 'updated_at'])

    def __str__(self):
        return f"{self.field.name} update by {self.agent} at {self.created_at}"
