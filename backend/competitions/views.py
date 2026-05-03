from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from task_bank.services import TaskSetGenerator
from task_bank.models import TaskSet, TaskSetType, TaskSetItem

from .models import Match


class CreateMatchView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        subject = request.data.get("subject", "prof_math")

        if not subject:
            return Response({"error": "subject required"}, status=400)

        generator = TaskSetGenerator()
        tasks = generator.generate(
            user=request.user,
            subject=subject,
            task_numbers=list(range(1, 27)),
            match=True,
        )

        task_set = TaskSet.objects.create(
            name=f"Match {subject}",
            subject=subject,
            author=request.user,
            type=TaskSetType.EXAM
        )

        for i, task in enumerate(tasks, start=1):
            TaskSetItem.objects.create(
                task_set=task_set,
                task=task,
                order=i
            )

        match = Match.objects.create(
            host=request.user,
            task_set=task_set
        )

        return Response({
            "match_id": match.id
        })
