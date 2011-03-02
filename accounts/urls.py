from django.conf.urls.defaults import *
from speeqeweb import settings

urlpatterns = patterns('speeqeweb.accounts.views',
	(r'^register/$', 'register', 
	    {'template_name': 'registration/register.html', 'SSL': settings.ENABLE_SSL }, 'register'),
	(r'^order_history/(?P<venue_id>[\d]+)/$', 'order_history', 
	 	{'template_name': 'registration/order_history.html'}, 'order_history'),
	(r'^account_info/(?P<venue_id>[\d]+)/$', 'account_info', 
	 	{'template_name': 'registration/account_info.html'}, 'account_info'),
	(r'^account_info_result/(?P<venue_id>[\d]+)/$', 'account_info_result', 
	 	{'template_name': 'registration/account_info_result.html'}, 'account_info_result'),
	(r'^order_details/(?P<venue_id>[\d]+)-(?P<order_id>[-\d]+)/$', 'order_details', 
	 	{'template_name': 'registration/order_details.html'}, 'order_details'),
)

urlpatterns += patterns('django.contrib.auth.views',
	(r'^login/$', 'login', 
	 {'template_name': 'registration/login.html', 'SSL': settings.ENABLE_SSL }, 'login'),
)