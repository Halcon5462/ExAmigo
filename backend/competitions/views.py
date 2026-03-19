from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Match


class CreateMatchView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        match = Match.objects.create(
            host=request.user
        )

        return Response({
            "match_id": match.id
        })