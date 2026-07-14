-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'ADVISOR', 'INSTITUTION_REP', 'ADMIN');

-- CreateEnum
CREATE TYPE "Sentiment" AS ENUM ('PENDING', 'POSITIVE', 'NEUTRAL', 'NEGATIVE');

-- CreateEnum
CREATE TYPE "FlagReason" AS ENUM ('BIASED', 'OUTDATED', 'OFFENSIVE', 'SPAM', 'AUTO_NEGATIVE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('MATCHED_QUESTION', 'NEW_RESPONSE', 'RESPONSE_UPVOTED', 'VERIFICATION_APPROVED', 'VERIFICATION_REJECTED', 'AUTO_FLAG_RESOLVED', 'RESPONSE_HIDDEN', 'PRIVATE_MESSAGE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" TEXT,
    "passwordResetToken" TEXT,
    "passwordResetExpiresAt" TIMESTAMP(3),
    "profilePhoto" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "educationLevel" TEXT NOT NULL,
    "countryOfResidence" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdvisorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "programme" TEXT NOT NULL,
    "yearOfEntry" INTEGER NOT NULL,
    "yearOfGraduation" INTEGER,
    "currentStatus" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "idVerificationUrl" TEXT,
    "verificationReviewedBy" TEXT,
    "verificationReviewedAt" TIMESTAMP(3),
    "verificationRejectionReason" TEXT,
    "credibilityScore" INTEGER NOT NULL DEFAULT 0,
    "totalUpvotes" INTEGER NOT NULL DEFAULT 0,
    "responseAcceptanceRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdvisorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "website" TEXT,
    "isClaimed" BOOLEAN NOT NULL DEFAULT false,
    "claimedBy" TEXT,
    "claimClaimedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "programme" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Response" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "yearAttended" INTEGER,
    "programme" TEXT,
    "body" TEXT NOT NULL,
    "whatWorkedWell" TEXT,
    "whatCouldBeBetter" TEXT,
    "wouldRecommend" TEXT,
    "sentiment" "Sentiment" NOT NULL DEFAULT 'PENDING',
    "sentimentConfidence" DOUBLE PRECISION,
    "flagCount" INTEGER NOT NULL DEFAULT 0,
    "isAutoFlagged" BOOLEAN NOT NULL DEFAULT false,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "upvoteCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Response_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResponseUpvote" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResponseUpvote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Flag" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "userId" TEXT,
    "reason" "FlagReason" NOT NULL,
    "description" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolutionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Flag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "questionId" TEXT,
    "responseId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "advisorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_StudentTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AdvisorInstitutions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AdvisorTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_QuestionTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_emailVerified_idx" ON "User"("emailVerified");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE INDEX "StudentProfile_userId_idx" ON "StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AdvisorProfile_userId_key" ON "AdvisorProfile"("userId");

-- CreateIndex
CREATE INDEX "AdvisorProfile_userId_idx" ON "AdvisorProfile"("userId");

-- CreateIndex
CREATE INDEX "AdvisorProfile_isVerified_idx" ON "AdvisorProfile"("isVerified");

-- CreateIndex
CREATE INDEX "AdvisorProfile_credibilityScore_idx" ON "AdvisorProfile"("credibilityScore");

-- CreateIndex
CREATE INDEX "Institution_name_idx" ON "Institution"("name");

-- CreateIndex
CREATE INDEX "Institution_country_idx" ON "Institution"("country");

-- CreateIndex
CREATE INDEX "Institution_isClaimed_idx" ON "Institution"("isClaimed");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "Tag_name_idx" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "Tag_category_idx" ON "Tag"("category");

-- CreateIndex
CREATE INDEX "Question_userId_idx" ON "Question"("userId");

-- CreateIndex
CREATE INDEX "Question_institutionId_idx" ON "Question"("institutionId");

-- CreateIndex
CREATE INDEX "Question_createdAt_idx" ON "Question"("createdAt");

-- CreateIndex
CREATE INDEX "Question_institutionId_createdAt_idx" ON "Question"("institutionId", "createdAt");

-- CreateIndex
CREATE INDEX "Question_userId_createdAt_idx" ON "Question"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Response_questionId_idx" ON "Response"("questionId");

-- CreateIndex
CREATE INDEX "Response_userId_idx" ON "Response"("userId");

-- CreateIndex
CREATE INDEX "Response_sentiment_idx" ON "Response"("sentiment");

-- CreateIndex
CREATE INDEX "Response_isHidden_idx" ON "Response"("isHidden");

-- CreateIndex
CREATE INDEX "Response_createdAt_idx" ON "Response"("createdAt");

-- CreateIndex
CREATE INDEX "Response_questionId_isHidden_createdAt_idx" ON "Response"("questionId", "isHidden", "createdAt");

-- CreateIndex
CREATE INDEX "Response_userId_isHidden_idx" ON "Response"("userId", "isHidden");

-- CreateIndex
CREATE INDEX "ResponseUpvote_responseId_idx" ON "ResponseUpvote"("responseId");

-- CreateIndex
CREATE INDEX "ResponseUpvote_userId_idx" ON "ResponseUpvote"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ResponseUpvote_responseId_userId_key" ON "ResponseUpvote"("responseId", "userId");

-- CreateIndex
CREATE INDEX "Flag_responseId_idx" ON "Flag"("responseId");

-- CreateIndex
CREATE INDEX "Flag_userId_idx" ON "Flag"("userId");

-- CreateIndex
CREATE INDEX "Flag_isResolved_idx" ON "Flag"("isResolved");

-- CreateIndex
CREATE INDEX "Flag_createdAt_idx" ON "Flag"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Flag_responseId_userId_key" ON "Flag"("responseId", "userId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_createdAt_idx" ON "Notification"("userId", "isRead", "createdAt");

-- CreateIndex
CREATE INDEX "Conversation_studentId_idx" ON "Conversation"("studentId");

-- CreateIndex
CREATE INDEX "Conversation_advisorId_idx" ON "Conversation"("advisorId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_questionId_studentId_advisorId_key" ON "Conversation"("questionId", "studentId", "advisorId");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE UNIQUE INDEX "_StudentTags_AB_unique" ON "_StudentTags"("A", "B");

-- CreateIndex
CREATE INDEX "_StudentTags_B_index" ON "_StudentTags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AdvisorInstitutions_AB_unique" ON "_AdvisorInstitutions"("A", "B");

-- CreateIndex
CREATE INDEX "_AdvisorInstitutions_B_index" ON "_AdvisorInstitutions"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AdvisorTags_AB_unique" ON "_AdvisorTags"("A", "B");

-- CreateIndex
CREATE INDEX "_AdvisorTags_B_index" ON "_AdvisorTags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_QuestionTags_AB_unique" ON "_QuestionTags"("A", "B");

-- CreateIndex
CREATE INDEX "_QuestionTags_B_index" ON "_QuestionTags"("B");

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvisorProfile" ADD CONSTRAINT "AdvisorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResponseUpvote" ADD CONSTRAINT "ResponseUpvote_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "Response"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResponseUpvote" ADD CONSTRAINT "ResponseUpvote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flag" ADD CONSTRAINT "Flag_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "Response"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flag" ADD CONSTRAINT "Flag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentTags" ADD CONSTRAINT "_StudentTags_A_fkey" FOREIGN KEY ("A") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentTags" ADD CONSTRAINT "_StudentTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdvisorInstitutions" ADD CONSTRAINT "_AdvisorInstitutions_A_fkey" FOREIGN KEY ("A") REFERENCES "AdvisorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdvisorInstitutions" ADD CONSTRAINT "_AdvisorInstitutions_B_fkey" FOREIGN KEY ("B") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdvisorTags" ADD CONSTRAINT "_AdvisorTags_A_fkey" FOREIGN KEY ("A") REFERENCES "AdvisorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdvisorTags" ADD CONSTRAINT "_AdvisorTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuestionTags" ADD CONSTRAINT "_QuestionTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuestionTags" ADD CONSTRAINT "_QuestionTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
