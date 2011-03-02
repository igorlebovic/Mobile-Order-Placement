from django.shortcuts import get_object_or_404, render_to_response
from speeqeweb.catalog.models import Category, Product, ProductReview, Venue
from speeqeweb.catalog.forms import ProductAddToCartForm, ProductReviewForm
from django.template import RequestContext

from django.core import urlresolvers
from speeqeweb.cart import cart
from django.http import HttpResponseRedirect, HttpResponse, HttpResponsePermanentRedirect

from speeqeweb.stats import stats
from speeqeweb.settings import PRODUCTS_PER_ROW
from speeqeweb.helpers import render_response

from django.contrib.auth.decorators import login_required
from django.template.loader import render_to_string, get_template
from django.utils import simplejson

import tagging
from tagging.models import Tag, TaggedItem

from django.core.cache import cache
from speeqeweb.settings import CACHE_TIMEOUT


def index(request, template_name):
    """ site home page """
    page_title = 'Skip The Line'
    return render_to_response(template_name, locals(), context_instance=RequestContext(request))


def search_venues(request, template_name="catalog/venue_search_result.json"):
    from django.db import connection
    cursor = connection.cursor()
    # Data retrieval operation - no commit required
    cursor.execute('SELECT id, slug, name, address_1, city, zip, state FROM catalog_venue') # WHERE baz = %s", [self.baz])
    venues = cursor.fetchall()
    return render_to_response(template_name, locals())


def show_venue_claimed(request, venue_id, venue_slug):
    """ load venue """
    venue_styling = venue_id
    venue_cache_key = request.path
    v = cache.get(venue_cache_key)
    if not v:
        v = get_object_or_404(Venue, id=venue_id)
        cache.set(venue_cache_key, v, CACHE_TIMEOUT)

    if request.method == 'POST':
        template_name = 'catalog/place_ajax.html'
    else:
        template_name = 'autologinclient.html'
        """ make sure we're using the right url slug """
        if venue_slug != v.slug:
            return HttpResponsePermanentRedirect('/%d-%s/' % (v.id, v.slug))
    
    """ load general page data """
    page_title = v.name
    support_orders = True
    
    """ load chat room """
    room = 'venue-' + venue_id
    username = request.user.username
    userpassword = None
    pcjid = None
    pcresource = None
    ip_address = request.META.get('HTTP_X_FORWARDED_FOR',
                                  request.META.get('REMOTE_ADDR', '')).split(', ')[-1]
    if not 'nologin' in request.GET and request.user.is_authenticated(): 
        userpassword = request.session.get('user_password', None)
            
        if 'cred' in request.GET and userpassword:
            resp = HttpResponse(userpassword)
            resp['Expires'] = datetime.datetime.now().strftime('%a, %d %b %Y %T GMT')
            return resp
    return render_to_response(template_name, locals(), context_instance=RequestContext(request))


def show_venue_unclaimed(request, venue_slug):
    import urllib2
    url = 'http://api.geoapi.com/v1/e/' + venue_slug
    url += '/view/listing?apikey=VlRKFBnkt8&pretty=1'    
    try:
        venue_id = venue_slug
        v = Venue()
        v.name = venue_slug
        v.id = venue_slug

        if request.method == 'POST':
            template_name = 'catalog/place_ajax.html'
        else:
            template_name = 'autologinclient.html'
        
        """ load general page data """
        page_title = venue_slug
        support_orders = False
        
        """ load chat room """
        room = 'venue-' + venue_id
        username = request.user.username
        userpassword = None
        pcjid = None
        pcresource = None
        ip_address = request.META.get('HTTP_X_FORWARDED_FOR',
                                      request.META.get('REMOTE_ADDR', '')).split(', ')[-1]
        if not 'nologin' in request.GET and request.user.is_authenticated(): 
            userpassword = request.session.get('user_password', None)
                
            if 'cred' in request.GET and userpassword:
                resp = HttpResponse(userpassword)
                resp['Expires'] = datetime.datetime.now().strftime('%a, %d %b %Y %T GMT')
                return resp
        
        return render_to_response(template_name, locals(), context_instance=RequestContext(request))
    except IOError:
        return HttpResponse('temporarily unavailable')


def show_category(request, venue_id, template_name="catalog/show_category.html"):
    """ view for each individual category page """
    list_cache_key = 'active_category_link_list'
    active_categories = cache.get(list_cache_key)
    if not active_categories:
        active_categories = Category.active.filter(venue=venue_id)
        cache.set(list_cache_key, active_categories, CACHE_TIMEOUT)    
    return render_to_response(template_name, locals(), context_instance=RequestContext(request))


def show_product_list(request, category_slug, template_name="catalog/show_list.html"):
    """ view for each individual category page """
    category_cache_key = request.path
    c = cache.get(category_cache_key)
    if not c:
        c = get_object_or_404(Category.active, slug=category_slug)
        cache.set(category_cache_key, c, CACHE_TIMEOUT)
    products = c.product_set.filter(is_active=True)
    page_title = c.name
    meta_keywords = c.meta_keywords
    meta_description = c.meta_description
    venue_id = c.venue.id
    
    from django.db import connection
    queries = connection.queries
    return render_to_response(template_name, locals(), context_instance=RequestContext(request))


def show_product(request, product_slug, template_name="catalog/show_product.html"):
    """ view for each product page """
    product_cache_key = request.path
    # try to get product from cache
    p = cache.get(product_cache_key)
    # if a cache miss, fall back on db query
    if not p:
        p = get_object_or_404(Product.active, slug=product_slug)
        # store item in cache for next time
        cache.set(product_cache_key, p, CACHE_TIMEOUT)
    categories = p.categories.filter(is_active=True)
    venue_id = categories[0].venue.id    
    page_title = p.name
    meta_keywords = p.meta_keywords
    meta_description = p.meta_description
    #create the unbound form. Notice the request as a keyword argument
    form = ProductAddToCartForm(request=request, label_suffix=':')
    # assign the hidden input the product slug
    form.fields['product_slug'].widget.attrs['value'] = product_slug
    # set test cookie to make sure cookies are enabled
    request.session.set_test_cookie()
    stats.log_product_view(request, p)
    return render_to_response(template_name, locals(), context_instance=RequestContext(request))


def tag_cloud(request, template_name="catalog/tag_cloud.html"):
    """ view containing a list of tags for active products, sized proportionately by relative
    frequency 
    """
    product_tags = Tag.objects.cloud_for_model(Product, steps=9, 
                                               distribution=tagging.utils.LOGARITHMIC,
                                               filters={'is_active': True })
    page_title = 'Product Tag Cloud'
    return render_to_response(template_name, locals(), context_instance=RequestContext(request))

def tag(request, tag, template_name="catalog/tag.html"):
    """ view listing products that have been tagged with a given tag """
    products = TaggedItem.objects.get_by_model(Product.active, tag)
    page_title = 'Products tagged with ' + tag
    return render_to_response(template_name, locals(), context_instance=RequestContext(request))

    
@login_required
def add_review(request):
    """ AJAX view that takes a form POST from a user submitting a new product review;
    requires a valid product slug and args from an instance of ProductReviewForm;
    return a JSON response containing two variables: 'review', which contains 
    the rendered template of the product review to update the product page, 
    and 'success', a True/False value indicating if the save was successful.
    """
    form = ProductReviewForm(request.POST)
    if form.is_valid():
        review = form.save(commit=False)
        slug = request.POST.get('slug')
        product = Product.active.get(slug=slug)
        review.user = request.user
        review.product = product
        review.save()
    
        template = "catalog/product_review.html"
        html = render_to_string(template, {'review': review })
        response = simplejson.dumps({'success':'True', 'html': html})
        
    else:
        html = form.errors.as_ul()
        response = simplejson.dumps({'success':'False', 'html': html})
    return HttpResponse(response, 
                        content_type='application/javascript; charset=utf-8')

@login_required
def add_tag(request):
    """ AJAX view that takes a form POST containing variables for a new product tag;
    requires a valid product slug and comma-delimited tag list; returns a JSON response 
    containing two variables: 'success', indicating the status of save operation, and 'tag',
    which contains rendered HTML of all product pages for updating the product page.
    """
    tags = request.POST.get('tag','')
    slug = request.POST.get('slug','')
    if len(tags) > 2:
        p = Product.active.get(slug=slug)
        html = u''
        template = "catalog/tag_link.html"
        for tag in tags.split():
            tag.strip(',')
            Tag.objects.add_tag(p,tag)
        for tag in p.tags:
            html += render_to_string(template, {'tag': tag })
        response = simplejson.dumps({'success':'True', 'html': html })
    else:
        response = simplejson.dumps({'success':'False'})
    return HttpResponse(response,
                        content_type='application/javascript; charset=utf-8')