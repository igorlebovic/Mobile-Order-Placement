from django import template
from django.contrib.flatpages.models import FlatPage
from speeqeweb.catalog.models import Category
from speeqeweb.cart import cart

from django.core.cache import cache
from speeqeweb.settings import CACHE_TIMEOUT

register = template.Library()

@register.inclusion_tag("tags/merchant_right_button.html")
def merchant_right_button(venue_id, domain_name):
    cart = 'Cart'
    return {'cart': cart, 'venue_id': venue_id, 'domain_name': domain_name, }
