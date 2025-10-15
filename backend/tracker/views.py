from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db import IntegrityError
from .models import Satellite, SatellitePosition, UserSatelliteSelection
from .serializers import (
    UserRegistrationSerializer,
    SatelliteSerializer,
    SatellitePositionSerializer,
    UserSatelliteSelectionSerializer
)


class UserRegistrationView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': {
                'username': user.username,
                'email': user.email
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class UserLoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'error': 'Please provide both username and password'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(username=username, password=password)
        
        if user is None:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': {
                'username': user.username,
                'email': user.email
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })


class UserLogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'message': 'Logged out'}, status=status.HTTP_200_OK)


class SatelliteListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SatelliteSerializer
    queryset = Satellite.objects.filter(is_active=True)


class UserSatelliteSelectionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        selections = UserSatelliteSelection.objects.filter(
            user=request.user, is_active=True
        )
        serializer = UserSatelliteSelectionSerializer(selections, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = UserSatelliteSelectionSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        # Get the satellite from validated data
        satellite = serializer.validated_data.get('satellite')
        
        # Check if an active selection already exists
        existing_selection = UserSatelliteSelection.objects.filter(
            user=request.user,
            satellite=satellite,
            is_active=True
        ).first()
        
        if existing_selection:
            return Response(
                {
                    'error': 'You have already selected this satellite.',
                    'selection': UserSatelliteSelectionSerializer(existing_selection).data
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if an inactive selection exists and reactivate it
        inactive_selection = UserSatelliteSelection.objects.filter(
            user=request.user,
            satellite=satellite,
            is_active=False
        ).first()
        
        if inactive_selection:
            inactive_selection.is_active = True
            inactive_selection.save()
            return Response(
                UserSatelliteSelectionSerializer(inactive_selection).data,
                status=status.HTTP_200_OK
            )
        
        # Create new selection
        try:
            selection = serializer.save(user=request.user)
            return Response(
                UserSatelliteSelectionSerializer(selection).data,
                status=status.HTTP_201_CREATED
            )
        except IntegrityError:
            # Fallback in case of race condition
            return Response(
                {'error': 'This satellite is already in your selections.'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def delete(self, request, pk):
        try:
            selection = UserSatelliteSelection.objects.get(
                pk=pk, user=request.user, is_active=True
            )
            selection.is_active = False
            selection.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except UserSatelliteSelection.DoesNotExist:
            return Response(
                {'error': 'Selection not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class SatellitePositionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Get user's active satellite selections
        selections = UserSatelliteSelection.objects.filter(
            user=request.user, is_active=True
        ).select_related('satellite')
        
        result = {}
        
        # For each selected satellite, get its latest positions
        for selection in selections:
            satellite = selection.satellite
            sat_name = satellite.name
            
            # Get latest 10 positions for this satellite
            positions = SatellitePosition.objects.filter(
                user=request.user,
                satellite=satellite
            ).order_by('-timestamp')[:10]
            
            result[sat_name] = []
            for pos in positions:
                result[sat_name].append({
                    'timestamp': pos.timestamp.isoformat(),
                    'latitude': pos.latitude,
                    'longitude': pos.longitude,
                    'altitude': pos.altitude,
                    'velocity': pos.velocity
                })
        
        return Response(result)