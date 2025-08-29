// components/TaxDocumentDetails.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const TaxDocumentDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { document } = route.params;

  const InfoSection = ({ title, items, icon }) => (
    <View style={styles.infoSection}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name={icon} size={20} color="#D96F32" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>
        {items.map((item, index) => (
          <View key={index} style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listItemText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const DetailCard = ({ title, content, icon, color = '#D96F32' }) => (
    <View style={styles.detailCard}>
      <View style={styles.detailHeader}>
        <MaterialIcons name={icon} size={20} color={color} />
        <Text style={styles.detailTitle}>{title}</Text>
      </View>
      <Text style={styles.detailContent}>{content}</Text>
    </View>
  );

  const InvestmentCard = ({ investment }) => (
    <View style={styles.investmentCard}>
      <Text style={styles.investmentName}>{investment.name}</Text>
      <View style={styles.investmentDetails}>
        <View style={styles.investmentRow}>
          <Text style={styles.investmentLabel}>Limit:</Text>
          <Text style={styles.investmentValue}>{investment.limit}</Text>
        </View>
        <View style={styles.investmentRow}>
          <Text style={styles.investmentLabel}>Lock-in:</Text>
          <Text style={styles.investmentValue}>{investment.lockIn}</Text>
        </View>
        <View style={styles.investmentRow}>
          <Text style={styles.investmentLabel}>Returns:</Text>
          <Text style={styles.investmentValue}>{investment.returns}</Text>
        </View>
      </View>
    </View>
  );

  const InstallmentCard = ({ installment }) => (
    <View style={styles.installmentCard}>
      <View style={styles.installmentHeader}>
        <Text style={styles.installmentTitle}>{installment.installment}</Text>
        <Text style={styles.installmentPercentage}>{installment.percentage}</Text>
      </View>
      <Text style={styles.installmentDate}>Due: {installment.date}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={document.color} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{document.title}</Text>
          <TouchableOpacity style={styles.shareButton}>
            <MaterialIcons name="share" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Document Header Info */}
        <View style={styles.documentHeader}>
          <View style={styles.documentIconContainer}>
            <MaterialIcons name={document.icon} size={32} color="#ffffff" />
          </View>
          <View style={styles.documentInfo}>
            <Text style={styles.documentTitle}>{document.title}</Text>
            <Text style={styles.documentCategory}>{document.category}</Text>
            <Text style={styles.documentDescription}>{document.description}</Text>
          </View>
        </View>

        {/* Quick Info Cards */}
        <View style={styles.quickInfoContainer}>
          <View style={styles.quickInfoCard}>
            <Text style={styles.quickInfoLabel}>Applicable For</Text>
            <Text style={styles.quickInfoValue}>{document.applicableFor}</Text>
          </View>
          <View style={styles.quickInfoCard}>
            <Text style={styles.quickInfoLabel}>Income Limit</Text>
            <Text style={styles.quickInfoValue}>{document.incomeLimit}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overview */}
        <View style={styles.overviewSection}>
          <View style={styles.overviewHeader}>
            <MaterialIcons name="info-outline" size={24} color="#D96F32" />
            <Text style={styles.overviewTitle}>Overview</Text>
          </View>
          <Text style={styles.overviewText}>{document.details.overview}</Text>
        </View>

        {/* Who Can File */}
        {document.details.whoCanFile && (
          <InfoSection
            title="Who Can File"
            items={document.details.whoCanFile}
            icon="check-circle"
          />
        )}

        {/* Who Cannot File */}
        {document.details.whoCannotFile && (
          <InfoSection
            title="Who Cannot File"
            items={document.details.whoCannotFile}
            icon="cancel"
          />
        )}

        {/* Required Documents */}
        {document.details.requiredDocuments && (
          <InfoSection
            title="Required Documents"
            items={document.details.requiredDocuments}
            icon="folder-open"
          />
        )}

        {/* Key Features */}
        {document.details.keyFeatures && (
          <InfoSection
            title="Key Features"
            items={document.details.keyFeatures}
            icon="star"
          />
        )}

        {/* Purpose (for Form 16) */}
        {document.details.purpose && (
          <InfoSection
            title="Purpose"
            items={document.details.purpose}
            icon="assignment"
          />
        )}

        {/* Parts (for Form 16) */}
        {document.details.parts && (
          <InfoSection
            title="Form Parts"
            items={document.details.parts}
            icon="description"
          />
        )}

        {/* Important Sections */}
        {document.details.importantSections && (
          <InfoSection
            title="Important Sections"
            items={document.details.importantSections}
            icon="priority-high"
          />
        )}

        {/* Common Sources (for Form 16A) */}
        {document.details.commonSources && (
          <InfoSection
            title="Common Sources"
            items={document.details.commonSources}
            icon="source"
          />
        )}

        {/* Eligible Investments */}
        {document.details.eligibleInvestments && (
          <View style={styles.investmentsSection}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="account-balance" size={20} color="#D96F32" />
              <Text style={styles.sectionTitle}>Eligible Investments</Text>
            </View>
            {document.details.eligibleInvestments.map((investment, index) => (
              <InvestmentCard key={index} investment={investment} />
            ))}
          </View>
        )}

        {/* Due Dates (for Advance Tax) */}
        {document.details.dueDates && (
          <View style={styles.installmentsSection}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="schedule" size={20} color="#D96F32" />
              <Text style={styles.sectionTitle}>Payment Schedule</Text>
            </View>
            {document.details.dueDates.map((installment, index) => (
              <InstallmentCard key={index} installment={installment} />
            ))}
          </View>
        )}

        {/* Tips */}
        {document.details.tips && (
          <InfoSection
            title="Tips"
            items={document.details.tips}
            icon="lightbulb"
          />
        )}

        {/* Important Details */}
        <View style={styles.importantDetails}>
          {document.details.dueDate && (
            <DetailCard
              title="Due Date"
              content={document.details.dueDate}
              icon="event"
              color="#F59E0B"
            />
          )}
          
          {document.details.penalty && (
            <DetailCard
              title="Late Filing Penalty"
              content={document.details.penalty}
              icon="warning"
              color="#EF4444"
            />
          )}

          {document.details.whenIssued && (
            <DetailCard
              title="When Issued"
              content={document.details.whenIssued}
              icon="schedule"
              color="#10B981"
            />
          )}

          {document.details.importance && (
            <DetailCard
              title="Importance"
              content={document.details.importance}
              icon="priority-high"
              color="#8B5CF6"
            />
          )}
        </View>

        {/* Last Updated */}
        <View style={styles.lastUpdatedContainer}>
          <MaterialIcons name="update" size={16} color="#8B7355" />
          <Text style={styles.lastUpdatedText}>
            Last updated: {document.lastUpdated}
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3E9DC',
  },
  headerGradient: {
    paddingBottom: 30,
    elevation: 8,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
    textAlign: 'center',
    flex: 1,
  },
  shareButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  documentHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  documentIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  documentInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  documentTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  documentCategory: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    marginBottom: 8,
  },
  documentDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
    fontWeight: '500',
  },
  quickInfoContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  quickInfoCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  quickInfoLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    marginBottom: 4,
  },
  quickInfoValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '800',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  overviewSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.1)',
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D1810',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  overviewText: {
    fontSize: 15,
    color: '#5D4E37',
    lineHeight: 22,
    fontWeight: '500',
  },
  infoSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.1)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2D1810',
    marginLeft: 8,
    letterSpacing: 0.2,
  },
  sectionContent: {
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D96F32',
    marginRight: 12,
    marginTop: 7,
  },
  listItemText: {
    flex: 1,
    fontSize: 14,
    color: '#5D4E37',
    lineHeight: 20,
    fontWeight: '500',
  },
  detailCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.1)',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2D1810',
    marginLeft: 8,
  },
  detailContent: {
    fontSize: 14,
    color: '#5D4E37',
    fontWeight: '600',
  },
  investmentsSection: {
    marginBottom: 20,
  },
  investmentCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.1)',
  },
  investmentName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2D1810',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  investmentDetails: {
    gap: 8,
  },
  investmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  investmentLabel: {
    fontSize: 14,
    color: '#8B7355',
    fontWeight: '600',
  },
  investmentValue: {
    fontSize: 14,
    color: '#2D1810',
    fontWeight: '700',
  },
  installmentsSection: {
    marginBottom: 20,
  },
  installmentCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#D96F32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(217, 111, 50, 0.1)',
  },
  installmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  installmentTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2D1810',
  },
  installmentPercentage: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D96F32',
  },
  installmentDate: {
    fontSize: 14,
    color: '#8B7355',
    fontWeight: '600',
  },
  importantDetails: {
    marginBottom: 20,
  },
  lastUpdatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#8B7355',
    marginLeft: 6,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default TaxDocumentDetails;
