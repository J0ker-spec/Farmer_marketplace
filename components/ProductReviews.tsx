import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../constants/colors';
import { useAuth } from '../hooks/useAuth';
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../services/firebase';

interface Review {
  review_id: string;
  buyer_id: string;
  rating: number;
  comment: string;
  created_at: string;
  buyer_name?: string;
}

interface ProductReviewsProps {
  productId: string;
  onReviewAdded?: () => void;
}

export default function ProductReviews({ productId, onReviewAdded }: ProductReviewsProps) {
  const { profile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const reviewsQuery = query(collection(db, 'reviews'), where('product_id', '==', productId));
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const rawReviews = reviewsSnapshot.docs.map(doc => ({
        review_id: doc.id,
        id: doc.id,
        ...doc.data()
      })) as any[];

      const buyerIds = Array.from(new Set(rawReviews.map(r => r.buyer_id).filter(Boolean)));
      const usersMap: Record<string, string> = {};
      await Promise.all(
        buyerIds.map(async (uid) => {
          try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
              usersMap[uid] = userDoc.data().name || 'Anonymous';
            }
          } catch (e) {}
        })
      );

      const formattedReviews = rawReviews.map((review: any) => ({
        ...review,
        buyer_name: usersMap[review.buyer_id] || 'Anonymous',
      }));

      // Sort in memory by created_at desc
      formattedReviews.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });

      setReviews(formattedReviews);

      // Check if current user has already reviewed
      if (profile?.user_id) {
        const userRev = formattedReviews.find((r: any) => r.buyer_id === profile.user_id);
        setUserReview(userRev || null);
        if (userRev) {
          setRating(userRev.rating);
          setComment(userRev.comment);
        }
      }
    } catch (e: any) {
      console.error('Failed to fetch reviews:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!profile?.user_id) {
      Alert.alert('Error', 'Please sign in to leave a review');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Error', 'Please add a comment');
      return;
    }

    try {
      setSubmitting(true);

      if (userReview) {
        // Update existing review
        await updateDoc(doc(db, 'reviews', userReview.review_id), { rating, comment });
      } else {
        // Insert new review
        const newDocRef = doc(collection(db, 'reviews'));
        await setDoc(newDocRef, {
          review_id: newDocRef.id,
          id: newDocRef.id,
          product_id: productId,
          buyer_id: profile.user_id,
          rating,
          comment,
          created_at: new Date().toISOString(),
        });
      }

      Alert.alert('Success', userReview ? 'Review updated successfully!' : 'Review added successfully!');
      setShowReviewForm(false);
      setComment('');
      setRating(5);
      await fetchReviews();
      onReviewAdded?.();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating =
    reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0;

  const ratingDistribution = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  return (
    <ScrollView style={styles.container}>
      {/* Rating Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.averageSection}>
          <Text style={styles.averageRating}>{averageRating}</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Ionicons
                key={i}
                name={i <= Math.round(parseFloat(averageRating as any)) ? 'star' : 'star-outline'}
                size={16}
                color="#FFB800"
              />
            ))}
          </View>
          <Text style={styles.reviewCount}>({reviews.length} reviews)</Text>
        </View>

        <View style={styles.distributionSection}>
          {[5, 4, 3, 2, 1].map((rating) => (
            <View key={rating} style={styles.distributionRow}>
              <Text style={styles.ratingLabel}>{rating}★</Text>
              <View style={styles.bar}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${reviews.length > 0 ? (ratingDistribution[rating as keyof typeof ratingDistribution] / reviews.length) * 100 : 0}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.ratingCount}>
                {ratingDistribution[rating as keyof typeof ratingDistribution]}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Review Form */}
      {profile?.user_id && (
        <View style={styles.formSection}>
          {!showReviewForm ? (
            <TouchableOpacity
              style={styles.addReviewButton}
              onPress={() => setShowReviewForm(true)}
            >
              <Ionicons name="add-circle-outline" size={24} color={Colors.white} />
              <Text style={styles.addReviewButtonText}>
                {userReview ? 'Edit Your Review' : 'Add a Review'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.form}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>{userReview ? 'Edit Review' : 'Share Your Review'}</Text>
                <TouchableOpacity onPress={() => setShowReviewForm(false)}>
                  <Ionicons name="close" size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.ratingSelector}>
                <Text style={styles.formLabel}>Rating</Text>
                <View style={styles.starsSelector}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TouchableOpacity key={i} onPress={() => setRating(i)}>
                      <Ionicons
                        name={i <= rating ? 'star' : 'star-outline'}
                        size={32}
                        color={i <= rating ? '#FFB800' : '#DDD'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.commentSection}>
                <Text style={styles.formLabel}>Your Comment</Text>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Share your thoughts about this product..."
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.formActions}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setShowReviewForm(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={handleSubmitReview}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {userReview ? 'Update Review' : 'Post Review'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Reviews List */}
      <View style={styles.reviewsSection}>
        <Text style={styles.sectionTitle}>Customer Reviews</Text>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
        ) : reviews.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No reviews yet. Be the first to review!</Text>
          </View>
        ) : (
          <FlatList
            scrollEnabled={false}
            data={reviews}
            keyExtractor={(item) => item.review_id}
            renderItem={({ item }) => (
              <View style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <View>
                    <Text style={styles.reviewerName}>{item.buyer_name}</Text>
                    <View style={styles.reviewRating}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Ionicons
                          key={i}
                          name={i <= item.rating ? 'star' : 'star-outline'}
                          size={14}
                          color="#FFB800"
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.reviewComment}>{item.comment}</Text>
              </View>
            )}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  averageSection: {
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  averageRating: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginVertical: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  distributionSection: {
    gap: 8,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingLabel: {
    width: 32,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  bar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#FFB800',
  },
  ratingCount: {
    width: 30,
    textAlign: 'right',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  formSection: {
    marginBottom: 16,
  },
  addReviewButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  addReviewButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  ratingSelector: {
    marginBottom: 16,
  },
  starsSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  commentSection: {
    marginBottom: 16,
  },
  commentInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    minHeight: 100,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: Colors.primary,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  reviewsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  loader: {
    marginVertical: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  reviewItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  reviewComment: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
});
