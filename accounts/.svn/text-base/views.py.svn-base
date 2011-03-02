from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.template import RequestContext
from django.shortcuts import render_to_response, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.core import urlresolvers
from django.http import HttpResponseRedirect

from speeqeweb.checkout.models import Order, OrderItem
from speeqeweb.accounts.forms import UserProfileForm, RegistrationForm
from speeqeweb.accounts import profile
from speeqeweb.catalog.models import Product


def register(request, template_name="registration/register.html"):
    postdata = request.POST.copy()
    form = RegistrationForm(postdata)
    if form.is_valid():
        #form.save()
        user = form.save(commit=False)  # new
        user.email = postdata.get('email','')  # new
        user.save()  # new
        un = postdata.get('username','')
        pw = postdata.get('password1','')
        from django.contrib.auth import login, authenticate
        new_user = authenticate(username=un, password=pw)
        if new_user and new_user.is_active:
            login(request, new_user)
            form_message='Account successfully created.'
            form_title='Account Created'
        else:
            form_message='Account could not be created.'
            form_title='Account Error'
    else:
	form_message='Provided data are invalid.'
	form_title='Invalid Data'
	ferrors=form.errors
    return render_to_response(template_name, locals(), context_instance=RequestContext(request))


@login_required
def order_history(request, venue_id, template_name="registration/order_history.html"):
    """ page displaying customer account information, past order list and account options """
    page_title = 'My Account'
    orders = Order.objects.filter(user=request.user.id, venue=venue_id).order_by('-id')
    name = request.user.username
    return render_to_response(template_name, locals(), context_instance=RequestContext(request))


@login_required
def order_details(request, venue_id, order_id, template_name="registration/order_details.html"):
    """ displays the details of a past customer order; order details can only be loaded by the same 
    user to whom the order instance belongs.
    
    """
    order = get_object_or_404(Order, id=order_id, user=request.user)
    page_title = 'Order Details for Order #' + order_id
    order_items = OrderItem.objects.filter(order=order)
    return render_to_response(template_name, locals(), context_instance=RequestContext(request))

    
@login_required
def account_info(request, venue_id, template_name="registration/account_info.html"):
    user_profile = profile.retrieve(request)
    form = UserProfileForm(instance=user_profile)
    return render_to_response(template_name, locals(), context_instance=RequestContext(request))


@login_required
def account_info_result(request, venue_id, template_name="registration/account_info_result.html"):
    postdata = request.POST.copy()
    form = UserProfileForm(postdata)
    if form.is_valid():
        profile.set(request)
        form_message='Account info successfully saved.'
        form_title='Data Saved'
    else:
        form_message='Error: incomplete information.'
        form_title='Data Error'
    return render_to_response(template_name, locals(), context_instance=RequestContext(request))