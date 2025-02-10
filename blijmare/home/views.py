import json

from django.db.models import Prefetch
from django.shortcuts import render
from django.views.decorators.http import require_POST

from .models import Standplaats, Reservering
from .serializers import StandplaatsSerializer, ReserveringSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import  Inschrijven # Replace with your actual app and model name


def admin_standplaatsen(request):
    template = "admin/standplaatsen.html"

    context = {}
    return render(request, template, context)


def admin_reservaties(request):
    template = "admin/reservaties.html"

    reservaties = [
        reservatie.to_dict() for reservatie in Reservering.objects.all()
    ]

    context = {
        'reservaties': reservaties
    }
    return render(request, template, context)


class MaakReserveringAPIView(APIView):
    def post(self, request, *args, **kwargs):

        data = request.data
        string_ids = data.get('standplaatsen', [])
        string_list = string_ids.split(',')
        int_ids = []

        for id in string_list:
            try:
                int_ids.append(int(id.strip()))
            except ValueError:
                print(f"Ongeldige waarde: {id}")

        data['standplaatsen'] = int_ids

        serializer = ReserveringSerializer(data=data)
        if serializer.is_valid():
            reservering = serializer.save()
            return Response({
                'status': 'success',
                'reservering_id': reservering.id
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'status': 'error',
                'message': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        # Logica voor het verwijderen van een reservering
        reservering_id = kwargs.get('reservering_id')  # Haal de reservering ID uit de URL

        try:
            reservering = Reservering.objects.get(id=reservering_id)
            reservering.delete()  # Verwijder de reservering
            return Response({
                'status': 'success',
                'message': f'Reservering {reservering_id} is succesvol verwijderd.'
            }, status=status.HTTP_204_NO_CONTENT)
        except Reservering.DoesNotExist:
            return Response({
                'status': 'error',
                'message': f'Reservering met ID {reservering_id} bestaat niet.'
            }, status=status.HTTP_404_NOT_FOUND)


class MapCenterApiView(APIView):
    """
    API view to retrieve or update latitude and longitude for a Wagtail page.
    """

    def get(self, request):
        """Retrieve the latitude and longitude of a page."""
        page = Inschrijven.objects.first()

        data = {
            "latitude": page.latiude,  # y = latitude
            "longitude": page.longitude # x = longitude
        }

        return Response(data, status=status.HTTP_200_OK)

    def patch(self, request):
        """Update the latitude and longitude of a page."""
        # Fetch the page by ID
        page = Inschrijven.objects.first()

        # Get latitude and longitude from request data
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')

        if latitude is None or longitude is None:
            return Response(
                {"error": "Both latitude and longitude are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            page.longitude = float(longitude),
            page.latitude = float(latitude)
            page.save()
            return Response({"message": "Location updated successfully"}, status=status.HTTP_200_OK)
        except ValueError:
            return Response({"error": "Invalid latitude or longitude values"}, status=status.HTTP_400_BAD_REQUEST)


class PolygonAPIView(APIView):
    def get(self, request, pk=None, format=None):
        """
        GET: Haalt alle polygonen op als pk niet wordt meegegeven,
        of één specifieke polygoon als pk wel is meegegeven.
        """
        if pk:
            try:
                standplaats = StandplaatsSerializer.objects.get(pk=pk)
            except Standplaats.DoesNotExist:
                return Response({"error": "Polygon not found"}, status=status.HTTP_404_NOT_FOUND)
            serializer = StandplaatsSerializer(standplaats)
        else:
            standplaatsen = Standplaats.objects.prefetch_related(
                Prefetch('reservaties', queryset=Reservering.objects.all())
            ).all()
            serializer = StandplaatsSerializer(standplaatsen, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        """
        POST: Maakt een nieuwe polygoon aan.
        """
        serializer = StandplaatsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk=None, format=None):
        """
        PUT: Werk een bestaande polygoon bij.
        Verwacht dat de URL een pk bevat.
        """
        if not pk:
            return Response({"error": "Polygon ID is required for update."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            standplaats = Standplaats.objects.get(pk=pk)
        except Standplaats.DoesNotExist:
            return Response({"error": "Polygon not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = StandplaatsSerializer(standplaats, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerwijderStandplaatsUitReserveringView(APIView):
    def delete(self, request, reservering_id, standplaats_id, format=None):
        """
        DELETE: Verwijder een standplaats uit een reservering.
        """
        try:
            # Haal de reservering en standplaats op
            reservering = Reservering.objects.get(pk=reservering_id)
            standplaats = Standplaats.objects.get(pk=standplaats_id)
        except Reservering.DoesNotExist:
            return Response({"error": "Reservering niet gevonden"}, status=status.HTTP_404_NOT_FOUND)
        except Standplaats.DoesNotExist:
            return Response({"error": "Standplaats niet gevonden"}, status=status.HTTP_404_NOT_FOUND)

        # Controleer of de standplaats gekoppeld is aan de reservering
        if not reservering.standplaatsen.filter(pk=standplaats_id).exists():
            return Response(
                {"error": "Standplaats is niet gekoppeld aan deze reservering"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verwijder de standplaats uit de reservering
        reservering.standplaatsen.remove(standplaats)

        if reservering.standplaatsen.count() == 0 :
            reservering.delete()

        return Response(
            {"status": "success", "message": "Standplaats is verwijderd uit de reservering"},
            status=status.HTTP_200_OK
        )