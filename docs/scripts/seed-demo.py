"""Run only in isolated pal-local web container; output contains ephemeral test JWTs."""
import io
import json
import os
import secrets
from datetime import timedelta

assert os.environ.get("PAL_LOCAL_DEMO") == "1", "Requires explicit PAL_LOCAL_DEMO=1"
assert os.environ.get("SMS_BACKEND") == "console", "Never run demo with live SMS"
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.models import User
from events.models import Event, EventTimeSlot, Registration
from payments.models import BaleBankCard
from PIL import Image

nonce = secrets.token_hex(3)
phone = "0912" + str(secrets.randbelow(10_000_000)).zfill(7)
customer = User.objects.create_user(phone_number=phone, full_name="")
staff = User.objects.create_user(phone_number="0913" + str(secrets.randbelow(10_000_000)).zfill(7), full_name="PAL local test staff", is_staff=True)
other = User.objects.create_user(phone_number="0914" + str(secrets.randbelow(10_000_000)).zfill(7), full_name="PAL local test other")
card, _ = BaleBankCard.objects.get_or_create(label="DEMO ONLY — DO NOT TRANSFER", defaults={"card_number": "0000000000000000", "account_holder": "DEMO ONLY", "bank_name": "تست محلی — واریز نکنید"})
# Keep public demo listing focused; retain previous demo registrations/history.
Event.objects.filter(title__startswith="رویداد تست پولی ").update(is_active=False)
Event.objects.filter(title__startswith="رویداد تست رایگان ").update(is_active=False)
paid = Event.objects.create(title=f"رویداد تست پولی {nonce}", description="فقط تست محلی؛ وجهی واریز نکنید.", price_rial=1500000, date=timezone.localdate() + timedelta(days=1))
free = Event.objects.create(title=f"رویداد تست رایگان {nonce}", price_rial=0, date=timezone.localdate() + timedelta(days=1))
slot = EventTimeSlot.objects.create(event=paid, start_time="10:00", end_time="11:00", registration_ceiling=3)
free_slot = EventTimeSlot.objects.create(event=free, start_time="11:00", end_time="12:00", registration_ceiling=3)
full_slot = EventTimeSlot.objects.create(event=free, start_time="12:00", end_time="13:00", registration_ceiling=1)
Registration.objects.create(user=other, event=free, time_slot=full_slot, status="confirmed")
image = Image.new("RGB", (32, 32), "white")
image.save("/tmp/pal-demo-receipt.png")

def tokens(user):
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}

print(json.dumps({"phone": phone, "paid_event": paid.id, "free_event": free.id, "paid_title": paid.title, "free_title": free.title, "slot": slot.id, "free_slot": free_slot.id, "full_slot": full_slot.id, "card": card.id, "staff": tokens(staff), "other": tokens(other)}, ensure_ascii=False))
