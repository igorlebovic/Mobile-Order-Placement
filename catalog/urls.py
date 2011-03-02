from django.conf.urls.defaults import *
from django.views.generic.simple import redirect_to

urlpatterns = patterns('',
    (r'^$','speeqeweb.catalog.views.index', {'template_name': 'autologinclient.html'}, 'index'),
    (r'^(?P<venue_id>[\d]+)-(?P<venue_slug>[-\w]+)/$', 'speeqeweb.catalog.views.show_venue_claimed'),
#    (r'^(?P<venue_slug>[-\w]+)/$', 'redirect_to', {'url': '/unclaimed/%(venue_slug)s/$'}),
    (r'^unclaimed/(?P<venue_slug>[-\w]+)/$', 'speeqeweb.catalog.views.show_venue_unclaimed'),
    (r'^category/(?P<venue_id>[\d]+)/$', 'speeqeweb.catalog.views.show_category',
       {'template_name': 'catalog/show_category.html'}, 'catalog_category'),
    (r'^show_product_list/(?P<category_slug>[-\w]+)/$', 'speeqeweb.catalog.views.show_product_list',
       {'template_name': 'catalog/show_list.html'}, 'show_product_list'),
    (r'^show_product/(?P<product_slug>[-\w]+)/$', 'speeqeweb.catalog.views.show_product',
       {'template_name': 'catalog/show_product.html'}, 'show_product'),
    (r'^venue-search/$', 'speeqeweb.catalog.views.search_venues', 
       {'template_name': 'catalog/venue_search_result.json'}),

    (r'^tag_cloud/$', 'speeqeweb.catalog.views.tag_cloud', 
       {'template_name': 'catalog/tag_cloud.html'}, 'tag_cloud'),
    (r'^tag/(?P<tag>[-\w]+)/$', 'speeqeweb.catalog.views.tag', 
       {'template_name': 'catalog/tag.html'}, 'tag'),
    (r'^review/product/add/$', 'speeqeweb.catalog.views.add_review', {}, 'add_product_review'),
    (r'^tag/product/add/$', 'add_tag'),
)