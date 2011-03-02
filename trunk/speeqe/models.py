from django.template.loader import get_template
from django.template import Context
from django.conf import settings

#
# Copyright (c) 2005 - 2008 Nathan Zorn, OGG, LLC 
# See LICENSE.txt for details
#

from django.db import models
import datetime
from django.contrib.auth.models import User

# Skipola specific code
class Place(models.Model):
  geoapi_guid = models.CharField(max_length=100)
  name = models.CharField(max_length=100)
  def __unicode__(self):
    return self.name

class App(models.Model):
  name = models.CharField(max_length=100)
  standard = models.CharField(max_length=1)
  priority = models.CharField(max_length=5)
  place = models.ManyToManyField(Place)
  def __unicode__(self):
    return self.name

class Menucategory(models.Model):
  name = models.CharField(max_length=100)
  place = models.ForeignKey(Place)
  priority = models.CharField(max_length=5)
  def __unicode__(self):
    return self.name

class Menuitem(models.Model):
  place = models.ForeignKey(Place)
  menucategory = models.ForeignKey(Menucategory)
  name = models.CharField(max_length=100)
  price = models.DecimalField(max_digits=8, decimal_places=2)
  priority = models.CharField(max_length=5)
  def __unicode__(self):
    return self.name


# Create your models here.
class Member(models.Model):
	"""Create a speeqe user."""
	username = username = models.CharField(max_length=255,
					       primary_key=True)
	password = models.CharField(max_length=30)
	realm = models.CharField(max_length=255)
	email = models.CharField(max_length=255)
	unique_together = (("username","realm"),)
	
	class Meta:
		db_table = 'authreg'
			


	def save(self):
		super(Member, self).save();

		u = None
		user_name = self.username +"@"+self.realm
		try:
			u = User.objects.get(username=user_name)
		except User.DoesNotExist:
			pass


		if not u:
			u = User.objects.create_user(user_name,
						     self.email,
						     user_name)

			u.save()

		u.username = user_name
		u.email = self.email
		u.set_password(self.password)
		u.last_login = datetime.datetime.utcnow()		
		u.save()
		
		

class Theme(models.Model):
	"""Model to store user's themes. """

	#html code of theme
	content = models.TextField()
	#theme creator/owner
	owner = models.ForeignKey(User)
	#name of theme
	name = models.CharField(max_length=255)


class EmailMessageTemplate(models.Model):

	name = models.CharField(max_length=255)
	template = models.TextField()


class EmailConfirmation(models.Model):

	code = models.CharField(max_length=255)
	confirmed = models.BooleanField(default=False)
	email = models.CharField(max_length=255)

	
