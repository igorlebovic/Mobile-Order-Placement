from django.conf.urls.defaults import *

urlpatterns = patterns('speeqeweb.merchant.views',
    (r'^(?P<venue_id>[\d]+)-(?P<venue_slug>[-\w]+)/$', 'merchant_home'),
    (r'^menu/(?P<venue_id>[\d]+)/$', 'merchant_menu'),
    (r'^pos/(?P<venue_id>[\d]+)/$', 'pos'),
    (r'^pos2/(?P<venue_id>[\d]+)/$', 'pos2'),
    (r'^login/(?P<error_type>[\d]+)/$', 'login'),
    (r'^manageorder/(?P<product_slug>[-\w]+)/$', 'manageorder'),
    (r'^manageorder2/(?P<product_slug>[-\w]+)/$', 'manageorder2'),
    (r'^manageorder3/(?P<product_slug>[-\w]+)/$', 'manageorder3'),
)
