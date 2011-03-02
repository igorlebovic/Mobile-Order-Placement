from django.conf.urls.defaults import *
from speeqeweb import settings

urlpatterns = patterns('speeqeweb.checkout.views',
    (r'^show_order/(?P<venue_id>[\d]+)/$', 'show_order',
        {'template_name': 'checkout/show_order.html', 'SSL': settings.ENABLE_SSL }, 'show_order'),
    (r'^modify_order/(?P<product_slug>[-\w]+)/$', 'modify_order',
        {'template_name': 'checkout/modify_order.html', 'SSL': settings.ENABLE_SSL }, 'modify_order'),

    (r'^ajax_merchant_response/(?P<venue_id>[\d]+)/$', 'ajax_merchant_response'),
    (r'^ajax_store_jid/$','ajax_store_jid'),
    (r'^ajax_store_anonym/$','ajax_store_anonym'),
    (r'^ajax_order_accepted/(?P<venue_id>[\d]+)/$','ajax_order_accepted'),
    (r'^ajax_order_lookup/(?P<venue_id>[\d]+)/$','ajax_order_lookup'),
    (r'^ajax_merchant_lookup/(?P<venue_id>[\d]+)/$','ajax_merchant_lookup'),
)