
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Share, Linking, Alert } from 'react-native';
import { useAppContext } from '../hooks/useAppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserTier } from '../types';

const HomeScreen = ({ navigation }: any) => {
  const { user, cards, loading } = useAppContext();

  const maxCards = user?.tier === UserTier.Pro ? 5 : 2;

  const handleShare = async (cardId: string) => {
    try {
      const url = Linking.createURL(`PublicCard`, { queryParams: { id: cardId } });
      await Share.share({ message: `Check out my digital business card: ${url}` });
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome, {user?.email}</Text>
          <Text style={styles.subtitle}>Your tier: <Text style={styles.tierText}>{user?.tier}</Text></Text>
        </View>

        {cards.length < maxCards && (
          <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('Setup')}>
            <Text style={styles.createButtonText}>+ Create New Card</Text>
          </TouchableOpacity>
        )}

        {cards.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No cards yet!</Text>
            <Text style={styles.emptySubtitle}>Get started by creating your first card.</Text>
            <TouchableOpacity style={styles.createFirstButton} onPress={() => navigation.navigate('Setup')}>
              <Text style={styles.createButtonText}>Create Your First Card</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {cards.map(card => (
          <View key={card.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Image source={{ uri: card.profile_photo }} style={styles.profileImage} />
              <View>
                <Text style={styles.cardName}>{card.full_name}</Text>
                <Text style={styles.cardRole}>{card.role}</Text>
              </View>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('PublicCard', { id: card.id })}>
                <Text style={styles.actionText}>Preview</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleShare(card.id)}>
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => Linking.openURL(card.qr_code_url)}>
                <Text style={styles.actionText}>QR</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0F172A' },
  subtitle: { fontSize: 16, color: '#64748B' },
  tierText: { fontWeight: 'bold', color: '#4338CA' },
  createButton: { backgroundColor: '#4338CA', padding: 12, borderRadius: 8, marginHorizontal: 20, marginBottom: 20, alignItems: 'center' },
  createButtonText: { color: 'white', fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', padding: 40, backgroundColor: 'white', margin: 20, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#1E293B' },
  emptySubtitle: { color: '#64748B', marginTop: 8, marginBottom: 20 },
  createFirstButton: { backgroundColor: '#4338CA', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  card: { backgroundColor: 'white', marginHorizontal: 20, marginBottom: 20, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  profileImage: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  cardName: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  cardRole: { color: '#64748B' },
  cardActions: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#F8FAFC', paddingVertical: 10 },
  actionButton: { padding: 10, flex: 1, alignItems: 'center' },
  actionText: { color: '#4338CA', fontWeight: '600' }
});

export default HomeScreen;
