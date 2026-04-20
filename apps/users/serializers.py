from rest_framework import serializers
from .models import User, UserProfile

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["email", "username", "password", "display_name"]

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            username=validated_data["username"],
            password=validated_data["password"],
            display_name=validated_data.get("display_name", ""),
        )
        UserProfile.objects.create(user=user)
        return user

class UserSerializer(serializers.ModelSerializer):
    xp_points = serializers.IntegerField(source="profile.xp_points", read_only=True)
    current_streak = serializers.IntegerField(source="profile.current_streak", read_only=True)

    class Meta:
        model = User
        fields = ["id", "email", "username", "display_name", "avatar_url", "xp_points", "current_streak"]
        read_only_fields = ["id", "email"]
