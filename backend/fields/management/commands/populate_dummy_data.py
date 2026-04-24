import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from fields.models import Field, FieldUpdate

from django.db import transaction

User = get_user_model()

class Command(BaseCommand):
    help = 'Populates the database with realistic dummy data for Smartseason'

    def handle(self, *args, **kwargs):
        self.stdout.write('Connecting to database and populating data...')

        try:
            with transaction.atomic():
                # 1. Create Users
                self.stdout.write('- Initializing users...')
                
                # Admin
                admin_user, created = User.objects.get_or_create(
                    username='admin_tony',
                    defaults={
                        'email': 'admin@smartseason.com',
                        'first_name': 'Tony',
                        'last_name': 'Felix',
                        'role': 'admin',
                        'is_staff': True,
                        'is_superuser': True
                    }
                )
                if created:
                    admin_user.set_password('admin123')
                    admin_user.save()
                    self.stdout.write(f'  [+] Created Admin: {admin_user.username}')
                else:
                    self.stdout.write(f'  [~] Admin {admin_user.username} already exists')

                # Agents
                agents_data = [
                    ('agent_sarah', 'Sarah', 'Kipchoge', 'sarah@smartseason.com'),
                    ('agent_john', 'John', 'Musa', 'john@smartseason.com'),
                    ('agent_faith', 'Faith', 'Wambui', 'faith@smartseason.com'),
                ]
                
                agents = []
                for username, first, last, email in agents_data:
                    user, created = User.objects.get_or_create(
                        username=username,
                        defaults={
                            'email': email,
                            'first_name': first,
                            'last_name': last,
                            'role': 'agent'
                        }
                    )
                    if created:
                        user.set_password('agent123')
                        user.save()
                        self.stdout.write(f'  [+] Created Agent: {username}')
                    else:
                        self.stdout.write(f'  [~] Agent {username} already exists')
                    agents.append(user)

                # 2. Create Fields
                self.stdout.write('- Initializing fields...')
                field_templates = [
                    ('Rift Valley North', 'Maize', -120),
                    ('Mount Kenya East', 'Beans', -45),
                    ('Western Plateaus', 'Wheat', -95),
                    ('Central Highlands', 'Potato', -20),
                    ('Coastal Plains', 'Maize', -10),
                    ('Lake Basin A', 'Rice', -150),
                    ('Northern Pastures', 'Maize', -80),
                    ('Southern Valleys', 'Wheat', -5),
                ]

                stages = ['planted', 'growing', 'ready', 'harvested']
                
                fields = []
                for name, crop, days_ago in field_templates:
                    planting_date = timezone.now().date() + timedelta(days=days_ago)
                    agent = random.choice(agents)
                    
                    field, created = Field.objects.get_or_create(
                        name=name,
                        defaults={
                            'crop_type': crop,
                            'planting_date': planting_date,
                            'assigned_agent': agent,
                            'created_by': admin_user,
                            'stage': 'planted'
                        }
                    )
                    if created:
                        self.stdout.write(f'  [+] Created Field: {name}')
                    fields.append(field)

                # 3. Create History of Updates
                self.stdout.write('- Generating activity history...')
                for field in fields:
                    max_stage_idx = random.randint(0, len(stages) - 1)
                    for i in range(max_stage_idx + 1):
                        stage = stages[i]
                        if not FieldUpdate.objects.filter(field=field, stage=stage).exists():
                            update = FieldUpdate.objects.create(
                                field=field,
                                agent=field.assigned_agent,
                                stage=stage,
                                notes=f"Periodic checkup for {field.name}. Everything looks {random.choice(['excellent', 'nominal', 'stable', 'satisfactory'])}."
                            )
                            update.created_at = timezone.now() - timedelta(days=(max_stage_idx - i) * 10)
                            update.save()
                    self.stdout.write(f'  [*] Logged history for {field.name}')

            self.stdout.write(self.style.SUCCESS('Successfully populated dummy data!'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'An error occurred: {str(e)}'))

        self.stdout.write(self.style.SUCCESS('Successfully populated dummy data!'))
        self.stdout.write(self.style.SUCCESS(f'Admin login: admin_tony / admin123'))
        self.stdout.write(self.style.SUCCESS(f'Agent login: agent_sarah / agent123'))
