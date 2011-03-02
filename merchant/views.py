from django.shortcuts import render_to_response, get_object_or_404
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.core import urlresolvers
from django.http import HttpResponse, HttpResponseRedirect

from speeqeweb.checkout.forms import CheckoutForm, CheckoutFormCash
from speeqeweb.checkout.models import Order, OrderItem
from speeqeweb.checkout import checkout
from speeqeweb.cart import cart
from speeqeweb.catalog.models import Category, Product, ProductReview, Venue
from speeqeweb.cart.models import CartItem

from speeqeweb.accounts import profile
from django.contrib.auth.decorators import login_required
from django.core.cache import cache
from speeqeweb.settings import CACHE_TIMEOUT
from speeqeweb.catalog.forms import ProductAddToCartForm, ProductReviewForm
from speeqeweb.stats import stats




from speeqeweb.catalog.models import Category, Product, ProductReview, Venue
from speeqeweb.cart.models import CartItem
from django.contrib.auth.decorators import login_required
from speeqeweb.catalog.forms import ProductAddToCartForm, ProductReviewForm
from speeqeweb.stats import stats

from speeqeweb.cart import cart
from django.shortcuts import render_to_response
from django.template import RequestContext
from speeqeweb.accounts import profile
from django.http import HttpResponseRedirect, HttpResponse, HttpResponsePermanentRedirect
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string, get_template
from django.core.cache import cache
from speeqeweb.settings import CACHE_TIMEOUT


def pos(request, venue_id):
    variables = RequestContext(request)
    return render_to_response('merchant/pos.html', locals(), context_instance=RequestContext(request))


def pos2(request, venue_id):
    variables = RequestContext(request)
    return render_to_response('merchant/pos2.html', locals(), context_instance=RequestContext(request))


def merchant_home(request, venue_id, venue_slug, template_name="autologinclient_merchant.html"):
    venue_styling = venue_id
    page_title = "Skipola"
    if request.user.is_authenticated():
        user_profile = profile.retrieve(request)
        if user_profile.user_level > 1:

            if venue_id == "0":
                venue_id = user_profile.place_id

            venue_cache_key = request.path
            v = cache.get(venue_cache_key)
            if not v:
                v = get_object_or_404(Venue, id=venue_id)
                cache.set(venue_cache_key, v, CACHE_TIMEOUT)


            """ make sure we're using the right url slug """
            if venue_slug != v.slug:
                return HttpResponsePermanentRedirect('/merchant/%d-%s/' % (v.id, v.slug))

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
        else:
            from django.contrib.auth import logout
            logout(request)
            return HttpResponseRedirect('/merchant')
    variables = RequestContext(request)
    return render_to_response(template_name, locals(), context_instance=RequestContext(request))


def merchant_menu(request, venue_id, template_name="merchant/merchant_menu.html"):
    venue_styling = venue_id
    page_title = "Skipola"
    if request.user.is_authenticated():
        user_profile = profile.retrieve(request)
        if user_profile.user_level > 1:

            if venue_id == "0":
                venue_id = user_profile.place_id

            venue_cache_key = request.path
            v = cache.get(venue_cache_key)
            if not v:
                v = get_object_or_404(Venue, id=venue_id)
                cache.set(venue_cache_key, v, CACHE_TIMEOUT)

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
        else:
            from django.contrib.auth import logout
            logout(request)
            return HttpResponseRedirect('/merchant')
    variables = RequestContext(request)
    return render_to_response(template_name, locals(), context_instance=RequestContext(request))
    
    
def manageorder(request, product_slug, template_name="merchant/manageorder.html"):
    """ view for each product page """
    postdata = request.POST.copy()
    cart_id = postdata['cart_id']
    customer_jid = postdata['xmpp_jid']
    cart_items2_1_accept = cart.merchant_cart_items2_1_accept(request, "1", cart_id)
    product_cache_key = request.path
    # try to get product from cache
    p = cache.get(product_cache_key)
    # if a cache miss, fall back on db query
    if not p:
        p = get_object_or_404(Product.active, slug=product_slug)
        # store item in cache for next time
        cache.set(product_cache_key, p, CACHE_TIMEOUT)
    categories = p.categories.filter(is_active=True)
    page_title = p.name
    meta_keywords = p.meta_keywords
    meta_description = p.meta_description
    venue_id = categories[0].venue.id
    # evaluate the HTTP method, change as needed
    #create the unbound form. Notice the request as a keyword argument
    form = ProductAddToCartForm(request=request, label_suffix=':')
    # assign the hidden input the product slug
    form.fields['product_slug'].widget.attrs['value'] = product_slug
    # set test cookie to make sure cookies are enabled
    request.session.set_test_cookie()
    stats.log_product_view(request, p)
    return render_to_response(template_name, locals(), context_instance=RequestContext(request))

    
def manageorder2(request, product_slug, template_name="merchant/manageorder2.html"):
    """ view for each product page """
    postdata = request.POST.copy()
    cart_id = postdata['cart_id']
    customer_jid = postdata['xmpp_jid']
    cart_items2_2_accept = cart.merchant_cart_items2_2_accept(request, "1", cart_id)
    product_cache_key = request.path
    # try to get product from cache
    p = cache.get(product_cache_key)
    # if a cache miss, fall back on db query
    if not p:
        p = get_object_or_404(Product.active, slug=product_slug)
        # store item in cache for next time
        cache.set(product_cache_key, p, CACHE_TIMEOUT)
    categories = p.categories.filter(is_active=True)
    page_title = p.name
    meta_keywords = p.meta_keywords
    meta_description = p.meta_description
    venue_id = categories[0].venue.id
    # evaluate the HTTP method, change as needed
    #create the unbound form. Notice the request as a keyword argument
    form = ProductAddToCartForm(request=request, label_suffix=':')
    # assign the hidden input the product slug
    form.fields['product_slug'].widget.attrs['value'] = product_slug
    # set test cookie to make sure cookies are enabled
    request.session.set_test_cookie()
    stats.log_product_view(request, p)
    return render_to_response(template_name, locals(), context_instance=RequestContext(request))
    
    
def manageorder3(request, product_slug, template_name="merchant/manageorder3.html"):
    """ view for each product page """
    postdata = request.POST.copy()
    cart_id = postdata['cart_id']
    customer_jid = postdata['xmpp_jid']
    cart_items2_3_accept = cart.merchant_cart_items2_3_accept(request, "1", cart_id)
    product_cache_key = request.path
    # try to get product from cache
    p = cache.get(product_cache_key)
    # if a cache miss, fall back on db query
    if not p:
        p = get_object_or_404(Product.active, slug=product_slug)
        # store item in cache for next time
        cache.set(product_cache_key, p, CACHE_TIMEOUT)
    categories = p.categories.filter(is_active=True)
    page_title = p.name
    meta_keywords = p.meta_keywords
    meta_description = p.meta_description
    venue_id = categories[0].venue.id
    # evaluate the HTTP method, change as needed
    #create the unbound form. Notice the request as a keyword argument
    form = ProductAddToCartForm(request=request, label_suffix=':')
    # assign the hidden input the product slug
    form.fields['product_slug'].widget.attrs['value'] = product_slug
    # set test cookie to make sure cookies are enabled
    request.session.set_test_cookie()
    stats.log_product_view(request, p)
    return render_to_response(template_name, locals(), context_instance=RequestContext(request))