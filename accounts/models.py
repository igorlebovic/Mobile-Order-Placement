from django.db import models
from django.contrib.auth.models import User
from speeqeweb.checkout.models import BaseOrderInfo

USER_LEVEL_CHOICES = (
    (1, 'Consumer'),
    (4, 'Waitress'),
    (8, 'Merchant'),
)

class UserProfile(BaseOrderInfo):
    """ stores customer order information used with the last order placed; can be attached to the checkout order form
    as a convenience to registered customers who have placed an order in the past.
    
    """
    
    user = models.ForeignKey(User, unique=True)
    
    user_level = models.CharField(max_length=1, choices=USER_LEVEL_CHOICES, default=1)
    place_id = models.IntegerField(blank=True, null=True)
    
    def __unicode__(self):
        return 'User Profile for: ' + self.user.username