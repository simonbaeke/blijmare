from django.urls import reverse
from rest_framework import serializers
from .models import Standplaats, Reservering

class StandplaatsSerializer(serializers.ModelSerializer):
    heeft_reservering = serializers.SerializerMethodField()
    delete_from_reservation_url = serializers.SerializerMethodField()
    reservering = serializers.SerializerMethodField()

    class Meta:
        model = Standplaats
        fields = ['id', 'naam', 'geojson', 'gebied', 'heeft_reservering', 'reservering', 'delete_from_reservation_url']
        extra_kwargs = {
            'naam': {'required': False},
            'id': {'required': False},
        }

    def get_delete_from_reservation_url(self, obj):
        if not obj.reservaties.count():
            return None


        return reverse('verwijder_standplaats_uit_reservering', kwargs={
            'reservering_id': obj.reservaties.first().id,
            'standplaats_id': obj.id
        })

    def get_heeft_reservering(self, obj):
        # Controleer of er een reservering bestaat voor deze standplaats
        return obj.reservaties.count() != 0

    def get_reservering(self, obj):
        # Haal de eerste gerelateerde reservering op
        reservering = Reservering.objects.filter(standplaatsen=obj).first()
        if reservering:
            return ReserveringSerializer(reservering).data
        return None


class ReserveringSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservering
        fields = ['id', 'voornaam', 'familienaam', 'standplaatsen']

    def validate_standplaatsen(self, value):
        # Controleer of de standplaatsen al zijn gereserveerd
        for standplaats in value:
            if not standplaats.reservaties.count() == 0:
                raise serializers.ValidationError(
                    f"Standplaats {standplaats.id} is al gereserveerd."
                )
        return value