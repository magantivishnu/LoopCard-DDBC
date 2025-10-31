
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Linking, Alert } from 'react-native';
import { useAppContext } from '../hooks/useAppContext';
import { CardData } from '../types';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const PublicCardViewScreen = ({ route }: any) => {
  const { id } = route.params;
  const { getCardById } = useAppContext();
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCard = async () => {
      setLoading(true);
      const foundCard = await getCardById(id);
      setCard(foundCard);
      setLoading(false);
    };
    fetchCard();
  }, [id]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#4338CA" /></View>;
  }

  if (!card) {
    return <View style={styles.center}><Text>Card not found</Text></View>;
  }
  
  const handleSaveContact = () => {
    // VCF generation is complex in RN, linking to a web service is a common workaround
    Alert.alert("Save Contact", "This feature would generate a .vcf file for download.");
  };

  const ContactButton = ({ href, icon, label, enabled }: { href: string, icon: any, label: string, enabled: boolean }) => {
    if (!enabled || !href) return null;
    return (
        <TouchableOpacity style={styles.contactButton} onPress={() => Linking.openURL(href)}>
            <Feather name={icon} size={24} color="#4338CA" />
            <Text style={styles.contactLabel}>{label}</Text>
        </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <ScrollView>
        <View style={styles.container}>
          <View>
            <Image source={{ uri: card.banner_photo }} style={styles.banner} />
            <Image source={{ uri: card.profile_photo }} style={styles.profileImage} />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveContact}>
              <Feather name="download" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{card.full_name}</Text>
            <Text style={styles.role}>{card.role} at {card.business_name}</Text>
            <Text style={styles.tagline}>{card.tagline}</Text>
          </View>

          <View style={styles.actionsGrid}>
              <ContactButton href={`tel:${card.contact.phone}`} icon="phone" label="Call" enabled={card.enabled_fields.phone && !!card.contact.phone} />
              <ContactButton href={`https://wa.me/${card.contact.whatsapp}`} icon="message-circle" label="WhatsApp" enabled={card.enabled_fields.whatsapp && !!card.contact.whatsapp} />
              <ContactButton href={`mailto:${card.contact.email}`} icon="mail" label="Email" enabled={card.enabled_fields.email && !!card.contact.email} />
              <ContactButton href={card.contact.website} icon="globe" label="Website" enabled={card.enabled_fields.website && !!card.contact.website} />
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { backgroundColor: 'white', maxWidth: 400, alignSelf: 'center', width: '100%', borderRadius: 20, marginVertical: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  banner: { width: '100%', height: 120, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  profileImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: 'white', alignSelf: 'center', marginTop: -50 },
  saveButton: { position: 'absolute', top: 15, right: 15, backgroundColor: 'rgba(0,0,0,0.4)', padding: 8, borderRadius: 20 },
  infoContainer: { alignItems: 'center', padding: 20, paddingTop: 10 },
  name: { fontSize: 26, fontWeight: 'bold', color: '#0F172A' },
  role: { fontSize: 18, color: '#64748B', marginTop: 4 },
  tagline: { fontSize: 16, color: '#64748B', textAlign: 'center', marginTop: 10 },
  actionsGrid: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, paddingBottom: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 20, marginTop: 10 },
  contactButton: { alignItems: 'center', flex: 1 },
  contactLabel: { marginTop: 5, color: '#4338CA', fontWeight: '600' }
});

export default PublicCardViewScreen;