
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { useAppContext } from '../hooks/useAppContext';
import { CardData, UserTier, SocialLink } from '../types';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

type FormData = Omit<CardData, 'id' | 'user_id' | 'qr_code_url' | 'created_at'>;

const SetupWizardScreen = ({ navigation }: any) => {
  const { addCard, user, uploadAsset } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);
  const [bannerPhotoUri, setBannerPhotoUri] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    profile_photo: '', banner_photo: '', full_name: '', business_name: '', role: '', tagline: '',
    contact: { phone: '', whatsapp: '', email: user?.email || '', website: '' },
    socials: [], address: '', gallery: [],
    enabled_fields: { phone: true, whatsapp: true, email: true, website: true, address: true, gallery: user?.tier !== UserTier.Free }
  });
  
  const pickImage = async (type: 'profile' | 'banner') => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'profile' ? [1, 1] : [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      if (type === 'profile') setProfilePhotoUri(result.assets[0].uri);
      else setBannerPhotoUri(result.assets[0].uri);
    }
  };

  const handleChange = (name: keyof Omit<FormData, 'contact' | 'socials' | 'enabled_fields'>, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContactChange = (name: keyof FormData['contact'], value: string) => {
    setFormData(prev => ({ ...prev, contact: { ...prev.contact, [name]: value } }));
  };
  
  const handleSubmit = async () => {
    if (!formData.full_name.trim()) {
        Alert.alert("Full name is mandatory.");
        return;
    }
    setLoading(true);
    setError(null);
    try {
      let finalData = { ...formData };
      
      if (profilePhotoUri) {
        const url = await uploadAsset(profilePhotoUri);
        if (!url) throw new Error("Failed to upload profile photo.");
        finalData.profile_photo = url;
      }

      if (bannerPhotoUri) {
        const url = await uploadAsset(bannerPhotoUri);
        if (!url) throw new Error("Failed to upload banner photo.");
        finalData.banner_photo = url;
      }
      
      await addCard(finalData);
      navigation.navigate('HomeTab');
    } catch (err: any) {
      setError(err.message || 'Failed to save card.');
      Alert.alert("Error", err.message || 'Failed to save card.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.form}>
            <Text style={styles.title}>Create Your LoopCard</Text>

            <View style={styles.imagePickerContainer}>
                <TouchableOpacity onPress={() => pickImage('banner')}>
                    {/* Fix: Replaced require with a remote placeholder URI to fix TypeScript error. */}
                    <Image source={bannerPhotoUri ? { uri: bannerPhotoUri } : { uri: 'https://picsum.photos/seed/placeholder-banner/800/200' }} style={styles.bannerImage} />
                    <Text style={styles.imagePickerText}>Change Banner</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => pickImage('profile')}>
                    {/* Fix: Replaced require with a remote placeholder URI to fix TypeScript error. */}
                    <Image source={profilePhotoUri ? { uri: profilePhotoUri } : { uri: 'https://i.pravatar.cc/150' }} style={styles.profileImage} />
                     <Text style={styles.imagePickerText}>Change Photo</Text>
                </TouchableOpacity>
            </View>

            <TextInput style={styles.input} placeholder="Full Name (Mandatory)" value={formData.full_name} onChangeText={v => handleChange('full_name', v)} />
            <TextInput style={styles.input} placeholder="Business Name" value={formData.business_name || ''} onChangeText={v => handleChange('business_name', v)} />
            <TextInput style={styles.input} placeholder="Role / Designation" value={formData.role || ''} onChangeText={v => handleChange('role', v)} />
            <TextInput style={[styles.input, {height: 100}]} multiline placeholder="About / Tagline" value={formData.tagline || ''} onChangeText={v => handleChange('tagline', v)} />

            <Text style={styles.sectionTitle}>Contact Details</Text>
            <TextInput style={styles.input} placeholder="Phone" value={formData.contact.phone} onChangeText={v => handleContactChange('phone', v)} keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder="WhatsApp" value={formData.contact.whatsapp} onChangeText={v => handleContactChange('whatsapp', v)} keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder="Email" value={formData.contact.email} onChangeText={v => handleContactChange('email', v)} keyboardType="email-address" />
            <TextInput style={styles.input} placeholder="Website" value={formData.contact.website} onChangeText={v => handleContactChange('website', v)} />

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitButtonText}>Save & Generate Card</Text>}
            </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Create placeholder assets in an `assets` folder
// assets/placeholder-banner.png (a generic wide image)
// assets/placeholder-profile.png (a generic square image)

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    form: { padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    imagePickerContainer: { marginBottom: 20, alignItems: 'center' },
    bannerImage: { width: '100%', height: 100, backgroundColor: '#E2E8F0', borderRadius: 8 },
    profileImage: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E2E8F0', marginTop: -40, borderWidth: 4, borderColor: 'white' },
    imagePickerText: { color: '#4338CA', textAlign: 'center', marginTop: 5 },
    input: { borderWidth: 1, borderColor: '#CBD5E1', padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 15, backgroundColor: 'white' },
    sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 10, marginBottom: 10 },
    submitButton: { backgroundColor: '#059669', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
    submitButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});

export default SetupWizardScreen;