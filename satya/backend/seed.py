"""
SATYA Demo Data Seeder
Seeds the database with realistic demo data for:
- 1 admin user + demo entrepreneur
- 10 mentors
- 15 suppliers  
- 10 buyers
- 5 SHGs/organizations
- 10 government schemes
- Market data for Tamil Nadu districts

Run: python seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, timezone
from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models.user import User, UserRole
from app.models.entrepreneur import EntrepreneurProfile
from app.models.network import Mentor, Supplier, Buyer, Organization
from app.models.scheme import GovernmentScheme, SchemeEmbedding
from app.models.market import MarketData
from app.core.security import get_password_hash

# Create all tables
Base.metadata.create_all(bind=engine)

VERIFIED_AT = datetime(2025, 1, 1, tzinfo=timezone.utc)


def seed_users(db):
    print("Seeding users...")
    users_data = [
        {"email": "admin@satya.ai", "full_name": "SATYA Admin", "role": UserRole.ADMIN, "password": "Admin@1234"},
        {"email": "demo@satya.ai", "full_name": "Lakshmi Devi", "role": UserRole.ENTREPRENEUR, "password": "Demo@1234"},
        {"email": "priya@satya.ai", "full_name": "Priya Selvam", "role": UserRole.ENTREPRENEUR, "password": "Demo@1234"},
        {"email": "rajan@satya.ai", "full_name": "Rajan Kumar", "role": UserRole.ENTREPRENEUR, "password": "Demo@1234"},
    ]
    created = []
    for ud in users_data:
        if not db.query(User).filter(User.email == ud["email"]).first():
            user = User(
                email=ud["email"],
                full_name=ud["full_name"],
                role=ud["role"],
                password_hash=get_password_hash(ud["password"]),
                preferred_language="ta" if ud["role"] == UserRole.ENTREPRENEUR else "en",
                is_active=True,
                is_demo=True,
            )
            db.add(user)
            created.append(user)
    db.commit()
    print(f"  Created {len(created)} users")
    return db.query(User).filter(User.is_demo == True).all()


def seed_entrepreneur_profiles(db, users):
    print("Seeding entrepreneur profiles...")
    demo_user = db.query(User).filter(User.email == "demo@satya.ai").first()
    if demo_user and not db.query(EntrepreneurProfile).filter(EntrepreneurProfile.user_id == demo_user.id).first():
        profile = EntrepreneurProfile(
            user_id=demo_user.id,
            age=32,
            state="Tamil Nadu",
            district="Salem",
            village_town="Yercaud",
            skills=["food processing", "cooking", "sales"],
            previous_experience="5 years homemaker, helped family with small scale pickle making",
            business_category="Food Processing",
            business_idea="Small food-processing unit — pickles, papads, and spice powders",
            is_existing_business=False,
            business_stage="idea",
            available_capital=200000,
            expected_investment=350000,
            family_members_involved=2,
            business_goals="Generate monthly income of ₹20,000 and employ 2 local women",
            monthly_income_target=20000,
            onboarding_completed=True,
            opportunity_score=78,
        )
        db.add(profile)
    db.commit()
    print("  Entrepreneur profiles seeded")


def seed_mentors(db):
    print("Seeding mentors...")
    mentors = [
        {
            "name": "Dr. Sundar Rajan", "bio": "Former NABARD officer with 20+ years experience in rural finance and agri-business.",
            "expertise": ["Rural Finance", "Agri-business", "Government Schemes", "MSME"],
            "business_categories": ["Agriculture", "Food Processing", "Agri-business"],
            "languages": ["Tamil", "English", "Hindi"],
            "state": "Tamil Nadu", "district": "Coimbatore",
            "years_experience": 20, "businesses_mentored": 45, "rating": 4.9,
            "availability": "Weekends + Tuesday evenings",
        },
        {
            "name": "Meenakshi Krishnan", "bio": "Serial entrepreneur with 3 successful food processing businesses. Ex-ICICI Bank credit officer.",
            "expertise": ["Food Processing", "FSSAI Licensing", "Bank Loans", "Marketing"],
            "business_categories": ["Food Processing", "FMCG", "Home-based Business"],
            "languages": ["Tamil", "English"],
            "state": "Tamil Nadu", "district": "Salem",
            "years_experience": 12, "businesses_mentored": 28, "rating": 4.8,
            "availability": "Monday, Wednesday, Friday afternoons",
        },
        {
            "name": "Rajesh Patel", "bio": "Textile entrepreneur who built a handloom cooperative from scratch. Padma Shri awardee.",
            "expertise": ["Handloom", "Textile", "Cooperative Formation", "Export"],
            "business_categories": ["Textile", "Handicrafts", "Cooperative"],
            "languages": ["Hindi", "Gujarati", "English"],
            "state": "Gujarat", "district": "Surat",
            "years_experience": 25, "businesses_mentored": 60, "rating": 4.7,
            "availability": "Weekends",
        },
        {
            "name": "Anita Sharma", "bio": "Social entrepreneur and SHG federation leader. Expert in women empowerment and microfinance.",
            "expertise": ["SHG", "Microfinance", "Women Empowerment", "PMMY"],
            "business_categories": ["All categories", "Women-led Business", "Handicrafts"],
            "languages": ["Hindi", "English"],
            "state": "Uttar Pradesh", "district": "Lucknow",
            "years_experience": 15, "businesses_mentored": 120, "rating": 4.9,
            "availability": "Daily 5-7 PM",
        },
        {
            "name": "Venkatesan S.", "bio": "Agricultural engineer turned entrepreneur. Pioneer of FPO movement in Tamil Nadu.",
            "expertise": ["FPO", "Agriculture", "Supply Chain", "Organic Certification"],
            "business_categories": ["Agriculture", "Organic Farming", "Food Processing"],
            "languages": ["Tamil", "English"],
            "state": "Tamil Nadu", "district": "Trichy",
            "years_experience": 18, "businesses_mentored": 35, "rating": 4.6,
            "availability": "Tue-Thu mornings",
        },
        {
            "name": "Suresh Kumar Yadav", "bio": "Dairy cooperative leader. Helped 500+ farmers join dairy value chain.",
            "expertise": ["Dairy", "Animal Husbandry", "Cooperative", "Cold Chain"],
            "business_categories": ["Dairy", "Animal Husbandry", "Food Processing"],
            "languages": ["Hindi", "Bhojpuri"],
            "state": "Bihar", "district": "Patna",
            "years_experience": 22, "businesses_mentored": 80, "rating": 4.5,
            "availability": "Weekends",
        },
        {
            "name": "Fatima Begum", "bio": "Handicraft export specialist. Connects rural artisans with urban and international buyers.",
            "expertise": ["Handicrafts", "Export", "E-commerce", "Branding"],
            "business_categories": ["Handicrafts", "Textile", "Artisan"],
            "languages": ["Urdu", "Hindi", "English"],
            "state": "Rajasthan", "district": "Jaipur",
            "years_experience": 10, "businesses_mentored": 40, "rating": 4.7,
            "availability": "Monday-Friday 6-8 PM",
        },
        {
            "name": "Dr. Krishnamurthy", "bio": "Professor of entrepreneurship. Author of 'Rural Business Models in India'.",
            "expertise": ["Business Planning", "Market Research", "Financial Modeling"],
            "business_categories": ["All", "Manufacturing", "Services"],
            "languages": ["Tamil", "English"],
            "state": "Tamil Nadu", "district": "Chennai",
            "years_experience": 30, "businesses_mentored": 200, "rating": 4.8,
            "availability": "Saturdays 10 AM - 1 PM",
        },
        {
            "name": "Pradeep Singh", "bio": "Master potter and craft entrepreneur. Revived traditional pottery with modern design.",
            "expertise": ["Pottery", "Craft", "Design", "Tourism"],
            "business_categories": ["Handicrafts", "Tourism", "Artisan"],
            "languages": ["Hindi", "English"],
            "state": "Madhya Pradesh", "district": "Khajuraho",
            "years_experience": 20, "businesses_mentored": 25, "rating": 4.4,
            "availability": "Weekends",
        },
        {
            "name": "Lalitha Kumari", "bio": "Pioneer of women dairy cooperatives in Andhra Pradesh. Trainer for NABARD FLCC.",
            "expertise": ["Dairy", "Women SHG", "Cooperative", "Animal Feed"],
            "business_categories": ["Dairy", "Animal Husbandry", "Women-led Business"],
            "languages": ["Telugu", "Tamil", "English"],
            "state": "Andhra Pradesh", "district": "Vijayawada",
            "years_experience": 16, "businesses_mentored": 70, "rating": 4.8,
            "availability": "Wednesday & Saturday afternoons",
        },
    ]
    for md in mentors:
        if not db.query(Mentor).filter(Mentor.name == md["name"]).first():
            mentor = Mentor(**md, is_verified=True, is_active=True, is_demo=True)
            db.add(mentor)
    db.commit()
    print(f"  {len(mentors)} mentors seeded")


def seed_suppliers(db):
    print("Seeding suppliers...")
    suppliers = [
        {"name": "Salem Spice Hub", "category": "Food Processing", "products": ["Chilli powder", "Turmeric", "Cumin", "Coriander"], "price_range": "₹80-₹300/kg", "state": "Tamil Nadu", "district": "Salem", "phone": "9876543210", "description": "Wholesale supplier of food-grade spices and condiments. FSSAI certified.", "minimum_order": "10 kg"},
        {"name": "Coimbatore Packaging Co.", "category": "Packaging", "products": ["BOPP bags", "Glass jars", "PET bottles", "Labels"], "price_range": "₹2-₹50/unit", "state": "Tamil Nadu", "district": "Coimbatore", "phone": "9876543211", "description": "Food-grade packaging materials for SMEs.", "minimum_order": "500 units"},
        {"name": "Madurai Food Equipment Mart", "category": "Equipment", "products": ["Mixer grinder", "Dehydrator", "Sealing machine", "Weighing scale"], "price_range": "₹3,000-₹50,000/unit", "state": "Tamil Nadu", "district": "Madurai", "phone": "9876543212", "description": "Food processing equipment for small and medium enterprises.", "minimum_order": "1 unit"},
        {"name": "Namakkal Dairy Supplies", "category": "Dairy", "products": ["Raw milk", "Cream", "Butter", "Ghee base"], "price_range": "₹35-₹400/litre or kg", "state": "Tamil Nadu", "district": "Namakkal", "phone": "9876543213", "description": "Fresh dairy inputs from cooperative farms.", "minimum_order": "20 litres/day"},
        {"name": "Krishnagiri Mango Traders", "category": "Agriculture", "products": ["Alphonso mango", "Totapuri mango", "Banganapalli"], "price_range": "₹30-₹120/kg", "state": "Tamil Nadu", "district": "Krishnagiri", "phone": "9876543214", "description": "Seasonal mango supply for processing units.", "minimum_order": "50 kg"},
        {"name": "Tirupur Textile Mills", "category": "Textile", "products": ["Cotton fabric", "Knitted cloth", "Thread", "Buttons"], "price_range": "₹50-₹300/metre or kg", "state": "Tamil Nadu", "district": "Tirupur", "phone": "9876543215", "description": "Direct mill supply of cotton textiles.", "minimum_order": "50 metres"},
        {"name": "Erode Turmeric Traders", "category": "Agriculture", "products": ["Raw turmeric", "Turmeric powder", "Turmeric oil"], "price_range": "₹70-₹200/kg", "state": "Tamil Nadu", "district": "Erode", "phone": "9876543216", "description": "India's largest turmeric trading hub. Export quality.", "minimum_order": "25 kg"},
        {"name": "Chennai Raw Material Hub", "category": "Manufacturing", "products": ["Chemicals", "Packaging", "Industrial supplies"], "price_range": "Variable", "state": "Tamil Nadu", "district": "Chennai", "phone": "9876543217", "description": "One-stop source for manufacturing raw materials.", "minimum_order": "As per product"},
        {"name": "Jaipur Handicraft Materials", "category": "Handicrafts", "products": ["Clay", "Beads", "Fabric dye", "Metal wire", "Leather"], "price_range": "₹10-₹500/unit", "state": "Rajasthan", "district": "Jaipur", "phone": "9876543218", "description": "Artisan-grade raw materials for handicraft businesses.", "minimum_order": "Variable"},
        {"name": "Bihar Agro Inputs", "category": "Agriculture", "products": ["Seeds", "Organic fertilizer", "Pesticides", "Tools"], "price_range": "₹20-₹1,000/unit", "state": "Bihar", "district": "Patna", "phone": "9876543219", "description": "Agricultural inputs for rural farmers and entrepreneurs.", "minimum_order": "Variable"},
        {"name": "Andhra Chilli Farm", "category": "Agriculture", "products": ["Guntur chilli", "Dry chilli", "Chilli paste"], "price_range": "₹80-₹250/kg", "state": "Andhra Pradesh", "district": "Guntur", "phone": "9876543220", "description": "Farm-fresh Guntur chilli supply.", "minimum_order": "20 kg"},
        {"name": "MP Handloom Co-op", "category": "Textile", "products": ["Maheshwari silk", "Chanderi fabric", "Handloom sarees"], "price_range": "₹500-₹5,000/piece", "state": "Madhya Pradesh", "district": "Maheshwar", "phone": "9876543221", "description": "Handloom fabrics from artisan cooperatives.", "minimum_order": "10 pieces"},
        {"name": "UP Dairy Collective", "category": "Dairy", "products": ["Milk", "Paneer", "Curd", "Ghee"], "price_range": "₹40-₹600/kg or litre", "state": "Uttar Pradesh", "district": "Mathura", "phone": "9876543222", "description": "Cooperative dairy supply from 200+ farmers.", "minimum_order": "Daily delivery"},
        {"name": "Gujarat Plastic Packaging", "category": "Packaging", "products": ["Plastic containers", "Shrink wrap", "Pouches", "Labels"], "price_range": "₹1-₹30/unit", "state": "Gujarat", "district": "Ahmedabad", "phone": "9876543223", "description": "Food-grade plastic packaging manufacturer.", "minimum_order": "1000 units"},
        {"name": "Karnataka Bamboo Traders", "category": "Raw Material", "products": ["Bamboo sticks", "Bamboo sheets", "Cane", "Rattan"], "price_range": "₹5-₹50/piece", "state": "Karnataka", "district": "Bengaluru", "phone": "9876543224", "description": "Natural bamboo and cane for handicraft industries.", "minimum_order": "100 pieces"},
    ]
    for sd in suppliers:
        if not db.query(Supplier).filter(Supplier.name == sd["name"]).first():
            supplier = Supplier(**sd, is_verified=True, is_active=True, is_demo=True)
            db.add(supplier)
    db.commit()
    print(f"  {len(suppliers)} suppliers seeded")


def seed_buyers(db):
    print("Seeding buyers...")
    buyers = [
        {"name": "Big Basket Rural", "buyer_type": "E-commerce Platform", "products_required": ["Pickles", "Spice powder", "Organic produce", "Dairy"], "quantity_required": "100+ kg/month per product", "frequency": "Weekly", "price_expectation": "Market rate + 10%", "state": "Tamil Nadu", "district": "Chennai", "email": "rural@bigbasket.com", "description": "Sourcing rural food products for urban markets."},
        {"name": "Aavin Dairy", "buyer_type": "Government Co-operative", "products_required": ["Milk", "Curd", "Butter"], "quantity_required": "500+ litres/day", "frequency": "Daily", "price_expectation": "MSP + incentive", "state": "Tamil Nadu", "district": "Chennai", "email": "procurement@aavin.tn.gov.in", "description": "Tamil Nadu government dairy cooperative."},
        {"name": "Amazon Karigar", "buyer_type": "E-commerce Platform", "products_required": ["Handicrafts", "Handloom", "Artisan products"], "quantity_required": "50+ units/month", "frequency": "As per order", "price_expectation": "Negotiable", "state": "Karnataka", "district": "Bengaluru", "email": "karigar@amazon.in", "description": "Amazon's artisan products marketplace."},
        {"name": "ITC Agri Business", "buyer_type": "Corporate", "products_required": ["Spices", "Food grains", "Oilseeds"], "quantity_required": "1 MT+ per month", "frequency": "Monthly", "price_expectation": "MSP or above", "state": "Tamil Nadu", "district": "Chennai", "email": "agri@itc.in", "description": "ITC's agri sourcing for e-choupal and retail."},
        {"name": "Natural Ice Cream", "buyer_type": "Food Company", "products_required": ["Fresh fruits", "Dry fruits", "Natural flavors"], "quantity_required": "200+ kg/month", "frequency": "Weekly", "price_expectation": "Market premium", "state": "Gujarat", "district": "Ahmedabad", "email": "procurement@naturalicecream.com", "description": "Premium ice cream brand sourcing natural ingredients."},
        {"name": "Fabindia", "buyer_type": "Retail Chain", "products_required": ["Handloom fabrics", "Handicrafts", "Organic products"], "quantity_required": "As per design", "frequency": "Seasonal", "price_expectation": "Fair trade pricing", "state": "Delhi", "district": "New Delhi", "email": "sourcing@fabindia.com", "description": "Ethnic Indian products retail chain."},
        {"name": "Mother Dairy", "buyer_type": "Government Co-operative", "products_required": ["Milk", "Fruits", "Vegetables"], "quantity_required": "500+ kg/day", "frequency": "Daily", "price_expectation": "MSP + incentive", "state": "Delhi", "district": "New Delhi", "email": "procurement@motherdairy.com", "description": "Delhi's largest dairy cooperative."},
        {"name": "Nilgiris Supermarket", "buyer_type": "Retail Chain", "products_required": ["Pickles", "Dairy", "Snacks", "Fresh produce"], "quantity_required": "50+ kg/week", "frequency": "Weekly", "price_expectation": "Retail margin sharing", "state": "Tamil Nadu", "district": "Chennai", "email": "buying@nilgiris.in", "description": "South India's premium supermarket chain."},
        {"name": "Export Solutions India", "buyer_type": "Export Agent", "products_required": ["Handicrafts", "Spices", "Organic products"], "quantity_required": "As per export order", "frequency": "Monthly", "price_expectation": "International market rate", "state": "Tamil Nadu", "district": "Chennai", "email": "export@exportsolindia.com", "description": "Connects Indian rural producers with international markets."},
        {"name": "Chennai Whole Foods", "buyer_type": "Retailer", "products_required": ["Organic food", "Natural products", "Traditional foods"], "quantity_required": "20+ kg/week per product", "frequency": "Weekly", "price_expectation": "Premium pricing", "state": "Tamil Nadu", "district": "Chennai", "email": "buy@chennaiwholesfoods.com", "description": "Organic and natural food retail store."},
    ]
    for bd in buyers:
        if not db.query(Buyer).filter(Buyer.name == bd["name"]).first():
            buyer = Buyer(**bd, is_verified=True, is_active=True, is_demo=True)
            db.add(buyer)
    db.commit()
    print(f"  {len(buyers)} buyers seeded")


def seed_organizations(db):
    print("Seeding organizations...")
    orgs = [
        {"name": "Salem Women's SHG Federation", "org_type": "SHG", "description": "Federation of 50 self-help groups in Salem district. Provides microfinance, training, and market linkage.", "sectors": ["Food Processing", "Handicrafts", "Agriculture"], "support_types": ["Microfinance", "Training", "Market Linkage", "Group Formation"], "state": "Tamil Nadu", "district": "Salem", "members_count": 1200, "phone": "9876543230"},
        {"name": "Tamil Nadu FPO Alliance", "org_type": "FPO", "description": "Farmer Producer Organization alliance connecting 5000+ farmers for collective bargaining and market access.", "sectors": ["Agriculture", "Food Processing"], "support_types": ["Collective Marketing", "Input Supply", "Processing"], "state": "Tamil Nadu", "district": "Trichy", "members_count": 5000, "phone": "9876543231"},
        {"name": "Rural Innovation Hub", "org_type": "NGO", "description": "Incubator for rural entrepreneurs. Provides training, mentorship, and seed funding.", "sectors": ["Technology", "Manufacturing", "Services"], "support_types": ["Incubation", "Training", "Seed Funding", "Mentorship"], "state": "Tamil Nadu", "district": "Chennai", "members_count": 300, "phone": "9876543232"},
        {"name": "Grameen Microfinance Society", "org_type": "NGO", "description": "Provides microfinance and financial literacy to rural entrepreneurs and SHG members.", "sectors": ["All sectors"], "support_types": ["Microfinance", "Financial Literacy", "SHG Linkage"], "state": "Tamil Nadu", "district": "Vellore", "members_count": 8000, "phone": "9876543233"},
        {"name": "National Dairy Cooperative", "org_type": "Cooperative", "description": "Milk collection, chilling, and marketing cooperative for small dairy farmers.", "sectors": ["Dairy", "Animal Husbandry"], "support_types": ["Milk Collection", "Veterinary Services", "Training"], "state": "Tamil Nadu", "district": "Namakkal", "members_count": 2500, "phone": "9876543234"},
    ]
    for od in orgs:
        if not db.query(Organization).filter(Organization.name == od["name"]).first():
            org = Organization(**od, is_verified=True, is_demo=True)
            db.add(org)
    db.commit()
    print(f"  {len(orgs)} organizations seeded")


def seed_government_schemes(db):
    print("Seeding government schemes...")
    schemes = [
        {
            "name": "PM MUDRA Yojana — Shishu",
            "ministry": "Ministry of Finance",
            "scheme_type": "Central",
            "business_categories": ["All", "MSME", "Manufacturing", "Services", "Food Processing"],
            "target_beneficiaries": ["Micro entrepreneurs", "Small businesses", "Women entrepreneurs"],
            "description": "Micro Units Development & Refinance Agency provides loans up to ₹50,000 under Shishu category for micro enterprises.",
            "benefits": "Collateral-free loan up to ₹50,000 at low interest rate.",
            "eligibility": "Any Indian citizen with a viable business plan. Non-corporate, non-farm small/micro enterprises.",
            "required_documents": ["Aadhaar card", "Business proof", "Bank statement (6 months)", "Identity proof", "Address proof"],
            "application_process": "Apply at any commercial bank, RRB, MFI, or NBFC. Use PM MUDRA portal (mudra.org.in) for online application.",
            "max_loan_amount": 50000,
            "official_url": "https://www.mudra.org.in",
            "source_document": "MUDRA Yojana Official Guidelines 2024",
            "last_verified_at": VERIFIED_AT,
        },
        {
            "name": "PM MUDRA Yojana — Kishor",
            "ministry": "Ministry of Finance",
            "scheme_type": "Central",
            "business_categories": ["All", "MSME", "Manufacturing", "Services", "Food Processing"],
            "target_beneficiaries": ["Micro entrepreneurs", "Small businesses"],
            "description": "MUDRA Kishor category provides loans from ₹50,001 to ₹5 lakh for growing micro enterprises.",
            "benefits": "Collateral-free loan up to ₹5 lakh.",
            "eligibility": "Existing micro enterprises with proof of business activity.",
            "required_documents": ["Aadhaar", "Business proof", "Last 6 months bank statement", "Existing business proof"],
            "application_process": "Apply at scheduled commercial banks, RRBs, or NBFCs.",
            "max_loan_amount": 500000,
            "official_url": "https://www.mudra.org.in",
            "source_document": "MUDRA Yojana Official Guidelines 2024",
            "last_verified_at": VERIFIED_AT,
        },
        {
            "name": "PM Formalisation of Micro Food Processing Enterprises (PM-FME)",
            "ministry": "Ministry of Food Processing Industries",
            "scheme_type": "Central",
            "business_categories": ["Food Processing", "Agri-business", "Dairy"],
            "target_beneficiaries": ["Food processing entrepreneurs", "SHG members", "FPO members"],
            "description": "PM-FME provides financial, technical, and business support to micro food processing enterprises. Provides 35% subsidy (max ₹10 lakh per unit).",
            "benefits": "35% credit-linked capital subsidy, common infrastructure, branding & marketing support, training.",
            "eligibility": "Individual micro food processing units, SHG/FPO members, co-operatives. Turnover up to ₹2 crore.",
            "required_documents": ["Aadhaar", "Bank account", "FSSAI license or application", "Udyam registration", "Business proof"],
            "application_process": "Register on pmfme.mofpi.gov.in. Apply through state nodal agency.",
            "max_subsidy_amount": 1000000,
            "official_url": "https://pmfme.mofpi.gov.in",
            "source_document": "PM-FME Scheme Guidelines 2024",
            "last_verified_at": VERIFIED_AT,
        },
        {
            "name": "Pradhan Mantri Rozgar Protsahan Yojana (PMRPY)",
            "ministry": "Ministry of Labour & Employment",
            "scheme_type": "Central",
            "business_categories": ["All", "Manufacturing", "Services"],
            "target_beneficiaries": ["Employers who hire new employees", "MSME"],
            "description": "Government pays employer's full EPF contribution (12%) for 3 years for new employees earning up to ₹15,000/month.",
            "benefits": "100% employer EPF contribution paid by government for 3 years per new employee.",
            "eligibility": "EPFO-registered businesses hiring new workers. Workers must earn ≤ ₹15,000/month.",
            "required_documents": ["Aadhaar of new employees", "EPFO registration", "Bank account details"],
            "application_process": "Register on pmrpy.gov.in. Link EPFO establishment.",
            "official_url": "https://pmrpy.gov.in",
            "source_document": "PMRPY Scheme Guidelines",
            "last_verified_at": VERIFIED_AT,
        },
        {
            "name": "National Scheduled Castes Finance & Development Corporation (NSFDC)",
            "ministry": "Ministry of Social Justice & Empowerment",
            "scheme_type": "Central",
            "business_categories": ["All", "Manufacturing", "Services", "Agriculture"],
            "target_beneficiaries": ["SC community entrepreneurs"],
            "description": "Provides term loans at concessional interest rates (5-6%) for SC entrepreneurs for income-generating activities.",
            "benefits": "Loans at 5-6% interest for business activities. Direct/indirect finance available.",
            "eligibility": "SC community members with annual family income below ₹3 lakh (rural), ₹4 lakh (urban).",
            "required_documents": ["SC/ST certificate", "Income certificate", "Business proposal", "Aadhaar", "Bank account"],
            "application_process": "Apply through State Channelising Agencies (SCAs) in each state.",
            "max_loan_amount": 1500000,
            "official_url": "https://nsfdc.nic.in",
            "source_document": "NSFDC Scheme Catalogue 2024",
            "last_verified_at": VERIFIED_AT,
        },
        {
            "name": "Mahila Udyam Nidhi Scheme",
            "ministry": "Ministry of MSME",
            "scheme_type": "Central",
            "business_categories": ["All", "Manufacturing", "Services", "Food Processing"],
            "target_beneficiaries": ["Women entrepreneurs"],
            "description": "Soft loans for women entrepreneurs through SIDBI to set up/expand small-scale industrial units.",
            "benefits": "Soft loan (lower interest, longer moratorium) for women entrepreneurs.",
            "eligibility": "Women entrepreneurs setting up or expanding small enterprises.",
            "required_documents": ["Aadhaar", "Business plan", "Bank statement", "Identity proof", "Project report"],
            "application_process": "Apply through SIDBI or scheduled banks participating in the scheme.",
            "official_url": "https://www.sidbi.in",
            "source_document": "SIDBI Scheme Documentation",
            "last_verified_at": VERIFIED_AT,
        },
        {
            "name": "NABARD SHG-Bank Linkage Programme",
            "ministry": "NABARD",
            "scheme_type": "Central",
            "business_categories": ["Agriculture", "Food Processing", "Handicrafts", "All"],
            "target_beneficiaries": ["Self Help Group members", "Rural women"],
            "description": "Provides bank credit to SHGs for income-generating activities. SHG members can access credit at 10-12%.",
            "benefits": "Access to formal banking credit for SHG members. Group-based collateral.",
            "eligibility": "Active SHG members with 6+ months track record. SHG with good internal transactions.",
            "required_documents": ["SHG registration", "Group passbook", "Meeting minutes", "Member Aadhaar"],
            "application_process": "Approach any rural/cooperative bank or RRB. Bank will assess SHG creditworthiness.",
            "official_url": "https://nabard.org/shg-bank-linkage.aspx",
            "source_document": "NABARD Annual Report 2024",
            "last_verified_at": VERIFIED_AT,
        },
        {
            "name": "Tamil Nadu Adi Dravidar Housing Development Corporation (TAHDCO) — Entrepreneur Loan",
            "ministry": "Tamil Nadu Government",
            "scheme_type": "State",
            "state": "Tamil Nadu",
            "business_categories": ["All", "Manufacturing", "Services"],
            "target_beneficiaries": ["SC/ST entrepreneurs in Tamil Nadu"],
            "description": "Provides concessional loans to SC/ST entrepreneurs in Tamil Nadu for business activities.",
            "benefits": "Subsidized loans at 4-6% for business establishment.",
            "eligibility": "SC/ST community members in Tamil Nadu. Income criteria apply.",
            "required_documents": ["Community certificate", "Aadhaar", "Bank account", "Business proposal"],
            "application_process": "Apply at TAHDCO district offices.",
            "official_url": "https://www.tahdco.tn.gov.in",
            "source_document": "TAHDCO Official Website",
            "last_verified_at": VERIFIED_AT,
        },
        {
            "name": "KVIC Pradhan Mantri Employment Generation Programme (PMEGP)",
            "ministry": "Ministry of MSME / KVIC",
            "scheme_type": "Central",
            "business_categories": ["Manufacturing", "Services", "Food Processing", "Handicrafts"],
            "target_beneficiaries": ["Rural/urban unemployed youth", "Artisans", "Rural entrepreneurs"],
            "description": "Credit-linked subsidy for setting up new micro enterprises in non-farm sector. Up to 35% subsidy for rural applicants.",
            "benefits": "25-35% margin money (subsidy) on project cost. Max project cost: ₹50 lakh (manufacturing), ₹20 lakh (services).",
            "eligibility": "Age 18+. 8th pass for projects above ₹10 lakh. No income ceiling.",
            "required_documents": ["Aadhaar", "Education certificate", "Bank account", "Project report", "Photos"],
            "application_process": "Apply online at kviconline.gov.in/pmegpeportal.",
            "max_subsidy_amount": 1750000,
            "max_loan_amount": 5000000,
            "official_url": "https://kviconline.gov.in/pmegpeportal",
            "source_document": "PMEGP Guidelines 2024",
            "last_verified_at": VERIFIED_AT,
        },
        {
            "name": "Stand-Up India Scheme",
            "ministry": "Ministry of Finance / SIDBI",
            "scheme_type": "Central",
            "business_categories": ["Manufacturing", "Services", "Trading", "Food Processing"],
            "target_beneficiaries": ["SC/ST entrepreneurs", "Women entrepreneurs"],
            "description": "Facilitates bank loans between ₹10 lakh and ₹1 crore for SC/ST or women borrowers to set up greenfield enterprises.",
            "benefits": "Bank loans ₹10 lakh to ₹1 crore. Composite loan including term loan and working capital.",
            "eligibility": "SC/ST or Woman borrower for greenfield enterprise. Age 18+.",
            "required_documents": ["SC/ST or gender proof", "Aadhaar", "Business plan", "Bank statement", "Project report"],
            "application_process": "Apply at any Scheduled Commercial Bank branch. Online at standupmitra.in.",
            "max_loan_amount": 10000000,
            "official_url": "https://www.standupmitra.in",
            "source_document": "Stand-Up India Scheme Guidelines 2024",
            "last_verified_at": VERIFIED_AT,
        },
    ]
    for sd in schemes:
        if not db.query(GovernmentScheme).filter(GovernmentScheme.name == sd["name"]).first():
            scheme = GovernmentScheme(**sd, is_active=True, is_demo=True)
            db.add(scheme)
    db.commit()
    print(f"  {len(schemes)} government schemes seeded")


def seed_market_data(db):
    print("Seeding market data...")
    market_records = [
        {"state": "Tamil Nadu", "district": "Salem", "business_category": "Food Processing", "demand_score": 78, "competition_score": 45, "raw_material_score": 85, "transport_score": 70, "seasonality_score": 72, "opportunity_score": 78, "demand_level": "High", "competition_level": "Medium", "nearby_markets": ["Salem city market", "Attur market", "Mettur market"], "price_range_info": {"pickles": "₹80-₹200/kg", "spice_powder": "₹100-₹400/kg", "papads": "₹60-₹120/pack"}, "seasonal_patterns": "Demand peaks Oct-Feb for pickling season. Mango season (Apr-Jun) good for mango pickle.", "local_demand_indicators": ["Growing urban population", "Tourism (Yercaud hill station)", "Export demand for traditional foods"], "key_competitors": ["5-6 small pickle makers", "2 regional spice brands"], "opportunities": ["Hill station tourism market", "Online sales potential", "Tie-up with Nilgiris/Big Basket"], "challenges": ["Competition from established brands", "Packaging and labeling costs"]},
        {"state": "Tamil Nadu", "district": "Coimbatore", "business_category": "Textile", "demand_score": 82, "competition_score": 70, "raw_material_score": 90, "transport_score": 85, "seasonality_score": 75, "opportunity_score": 75, "demand_level": "High", "competition_level": "High", "nearby_markets": ["Tirupur garment cluster", "Coimbatore textile market"], "seasonal_patterns": "Festival seasons (Diwali, Pongal) drive high demand for traditional textiles.", "opportunities": ["Export market", "Ethnic fashion growing", "E-commerce"], "challenges": ["High competition from established mills", "Price pressure"]},
        {"state": "Tamil Nadu", "district": "Namakkal", "business_category": "Dairy", "demand_score": 85, "competition_score": 55, "raw_material_score": 90, "transport_score": 75, "seasonality_score": 80, "opportunity_score": 82, "demand_level": "High", "competition_level": "Medium", "nearby_markets": ["Namakkal milk market", "Rasipuram"], "seasonal_patterns": "Year-round demand. Supply may vary slightly in summer.", "opportunities": ["Aavin linkage", "Value-added dairy products", "Ghee/paneer production"], "challenges": ["Milk price fluctuations", "Cold storage cost"]},
        {"state": "Tamil Nadu", "district": "Erode", "business_category": "Agriculture", "demand_score": 80, "competition_score": 50, "raw_material_score": 95, "transport_score": 72, "seasonality_score": 65, "opportunity_score": 80, "demand_level": "High", "competition_level": "Medium", "nearby_markets": ["Erode turmeric market (Asia's largest)", "Gobichettipalayam"], "seasonal_patterns": "Turmeric harvested Jan-Mar. Price peaks Jun-Sep.", "opportunities": ["Organic turmeric export", "Value-added turmeric products", "Direct export"], "challenges": ["Price volatility", "Storage costs"]},
        {"state": "Gujarat", "district": "Surat", "business_category": "Textile", "demand_score": 88, "competition_score": 75, "raw_material_score": 85, "transport_score": 90, "seasonality_score": 80, "opportunity_score": 80, "demand_level": "High", "competition_level": "High", "nearby_markets": ["Surat textile market (Asia's largest)", "Sahara Darwaja"], "seasonal_patterns": "Wedding season (Nov-Feb) drives peak demand.", "opportunities": ["Export market", "Bridal collection", "Synthetic fabric growing"], "challenges": ["Intense competition", "Power cost"]},
        {"state": "Bihar", "district": "Patna", "business_category": "Food Processing", "demand_score": 70, "competition_score": 30, "raw_material_score": 75, "transport_score": 60, "seasonality_score": 70, "opportunity_score": 74, "demand_level": "High", "competition_level": "Low", "nearby_markets": ["Patna vegetable market", "Hajipur banana market"], "seasonal_patterns": "Lychee season (May-Jun) and mango season (May-Jul) for processing.", "opportunities": ["Low competition", "Large rural population", "Litchi processing potential"], "challenges": ["Infrastructure gaps", "Market access"]},
        {"state": "Rajasthan", "district": "Jaipur", "business_category": "Handicrafts", "demand_score": 85, "competition_score": 65, "raw_material_score": 80, "transport_score": 75, "seasonality_score": 82, "opportunity_score": 79, "demand_level": "High", "competition_level": "High", "nearby_markets": ["Johari Bazaar", "Tripolia Bazaar", "Tonk Road crafts market"], "seasonal_patterns": "Tourist season (Oct-Mar) drives peak demand.", "opportunities": ["Export potential", "Online craft marketplace", "Tourism linkage"], "challenges": ["Competition from China imports", "Certification needed for export"]},
    ]
    for md in market_records:
        existing = db.query(MarketData).filter(
            MarketData.state == md["state"],
            MarketData.district == md["district"],
            MarketData.business_category == md["business_category"],
        ).first()
        if not existing:
            market = MarketData(**md, data_source="Demo Data — SATYA Research Team", is_verified=False)
            db.add(market)
    db.commit()
    print(f"  {len(market_records)} market data records seeded")


def main():
    db = SessionLocal()
    try:
        print("\n🌱 SATYA Demo Data Seeder Starting...\n")
        users = seed_users(db)
        seed_entrepreneur_profiles(db, users)
        seed_mentors(db)
        seed_suppliers(db)
        seed_buyers(db)
        seed_organizations(db)
        seed_government_schemes(db)
        seed_market_data(db)
        print("\n✅ Demo data seeding completed!")
        print("\nDemo credentials:")
        print("  Admin:       admin@satya.ai / Admin@1234")
        print("  Entrepreneur: demo@satya.ai  / Demo@1234")
    except Exception as e:
        print(f"\n❌ Seeding failed: {e}")
        import traceback; traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
