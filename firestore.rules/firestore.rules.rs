rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null || request.resource.data.authorId == "anonymous";
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.authorId;
    }
  }
}
