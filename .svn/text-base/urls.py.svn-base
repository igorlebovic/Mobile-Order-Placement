from django.conf.urls.defaults import *
from django.conf import settings

from speeqeweb import settings
from django.contrib import admin
admin.autodiscover()
import os

urlpatterns = patterns('',
    (r'^admin/(.*)', admin.site.root),
    (r'^', include('speeqeweb.catalog.urls')),
    (r'^cart/', include('cart.urls')),
    (r'^checkout/', include('checkout.urls')),
    (r'^accounts/', include('accounts.urls')),
    (r'^accounts/', include('django.contrib.auth.urls')),
    (r'^search/', include('search.urls')),
    (r'^merchant/', include('merchant.urls')),
    (r'^merchant','speeqeweb.merchant.views.merchant_home', {'venue_id': "0", 'venue_slug': 'test'}),

    (r'^phonegap/$','speeqeweb.speeqe.views.phonegap'),

    # speeqeweb urls
    (r'^avatar-service/',   include('speeqeweb.avatars.urls')),
    (r'^join/validate/username/','speeqeweb.speeqe.views.validate_username'),
    (r'^join/validate/email/','speeqeweb.speeqe.views.validate_email'),
    (r'^join/','speeqeweb.speeqe.views.join'),
    (r'^virtualhost/(?P<room_name>[\w|\@|\_|:|\+|&|\-|#]+)\..+/','speeqeweb.speeqe.views.client'),    
    (r'^client/(?P<venue_id>[-\w]+)/room/(?P<room_name>[\w|\@|\.|\_|:|\+|&|\-|%|#]+)/','speeqeweb.speeqe.views.client'),
    (r'^client/(?P<venue_id>[-\w]+)/','speeqeweb.speeqe.views.client'),
    (r'^accounts/login/$', 'speeqeweb.speeqe.views.login'),
    (r'^accounts/ajax_login/$', 'speeqeweb.speeqe.views.ajax_login'),
    # (r'^accounts/logout/$', 'django.contrib.auth.views.logout'
    (r'^accounts/logout2/$', 'speeqeweb.speeqe.views.logout2'),
    (r'^accounts/password_change_done2/$', 'speeqeweb.speeqe.views.password_change_done2'),
    (r'^messagesearch/(?P<room>[\w|\@|\.|\_|:|\+|&|\-|%|#]+)/', 'speeqeweb.speeqe.views.room_message_search'),   
    (r'^messagesearch/$', 'speeqeweb.speeqe.views.room_message_search'),
    (r'^themes/new/$', 'speeqeweb.speeqe.views.new_theme'),
    (r'^themes/edit/(?P<theme_id>\d+)/', 'speeqeweb.speeqe.views.edit_theme'),
    (r'^themes/link/', 'speeqeweb.speeqe.views.link_theme_to_room'),
    (r'^themes/$', 'speeqeweb.speeqe.views.list_themes'),
    (r'^submit_log/', 'speeqeweb.speeqe.views.submit_log'),
)

if settings.SERVE_STATIC_URLS:
    urlpatterns += patterns('',
                            (r'^(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.DOCUMENT_ROOT }),
                            )