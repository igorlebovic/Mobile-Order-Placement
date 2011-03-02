from django.conf.urls.defaults import *

urlpatterns = patterns('speeqeweb.cart.views',
    (r'^show_cart/(?P<venue_id>[\d]+)/$', 'show_cart'),
    (r'^modify_cart/(?P<product_slug>[-\w]+)/$', 'modify_cart'),
)