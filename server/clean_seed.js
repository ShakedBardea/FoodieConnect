const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Group = require('./models/Group');
const Recipe = require('./models/Recipe');
const ChatMessage = require('./models/ChatMessage');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const cleanSeed = async () => {
  try {
    console.log('Clearing existing data...');
    await connectDB();
    
    // Clear all collections
    await User.deleteMany({});
    await Group.deleteMany({});
    await Recipe.deleteMany({});
    await ChatMessage.deleteMany({});
    console.log('Database cleared');

    console.log('Creating users...');

    // Regular users (2)
    const [userA, userB] = await User.create([
      {
        username: 'michael_user',
        email: 'michael@test.com',
        password: 'password123',
        fullName: 'Michael Levi',
        bio: 'Foodie who loves Mediterranean flavors',
      location: 'Tel Aviv',
        role: 'user',
        experience: 'Intermediate'
      },
      {
        username: 'noa_user',
        email: 'noa@test.com',
        password: 'password123',
        fullName: 'Noa Ben David',
        bio: 'Baking addict and dessert lover',
        location: 'Haifa',
        role: 'user',
        experience: 'Advanced'
      }
    ]);

    // Group admins (4)
    const [admin1, admin2, admin3, admin4] = await User.create([
      {
        username: 'bbq_admin',
        email: 'bbq_admin@test.com',
        password: 'password123',
        fullName: 'Jake Thompson',
        bio: 'Low & slow pitmaster',
        location: 'Austin',
        role: 'group_admin',
        experience: 'Professional'
      },
      {
        username: 'italian_admin',
        email: 'italian_admin@test.com',
        password: 'password123',
        fullName: 'Giulia Romano',
        bio: 'Nonna-approved Italian classics',
        location: 'Rome',
        role: 'group_admin',
        experience: 'Professional'
      },
      {
        username: 'vegan_admin',
        email: 'vegan_admin@test.com',
        password: 'password123',
        fullName: 'Ava Green',
        bio: 'Plant-based chef',
      location: 'Berlin',
        role: 'group_admin',
        experience: 'Advanced'
      },
      {
        username: 'asian_admin',
        email: 'asian_admin@test.com',
        password: 'password123',
        fullName: 'Kenji Sato',
        bio: 'From ramen to wok stir-fries',
        location: 'Tokyo',
        role: 'group_admin',
        experience: 'Professional'
      }
    ]);

    console.log('Created users: 2 regular, 4 group admins');

    // Create groups: each admin gets 2 groups
    console.log('Creating groups...');

    const groupsToCreate = [
      {
        name: 'BBQ Masters',
        description: 'All about smoking, grilling, and low & slow BBQ.',
        admin: admin1._id,
        members: [admin1._id, userA._id],
        category: 'BBQ & Grilling',
        isPrivate: false,
        coverImage: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&auto=format&fit=crop&q=60',
        rules: ['No dairy-based recipes here', 'Respect different techniques']
      },
      {
        name: 'Steak & Smoke',
        description: 'Cuts, rubs, and perfect sears.',
        admin: admin1._id,
        members: [admin1._id, userB._id],
        category: 'BBQ & Grilling',
        isPrivate: false,
        coverImage: 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=1200&auto=format&fit=crop&q=60',
        rules: ['No dairy-based recipes here', 'Share temps and doneness']
      },
      {
        name: 'Pasta Lovers',
        description: 'Regional pasta, sauces, and Italian comfort food.',
        admin: admin2._id,
        members: [admin2._id, userA._id],
        category: 'Italian Cooking',
        isPrivate: false,
        coverImage: 'https://images.unsplash.com/photo-1521389508051-d7ffb5dc8bbf?w=1200&auto=format&fit=crop&q=60',
        rules: ['Tag dairy when used', 'Fresh ingredients preferred']
      },
      {
        name: 'Italian Classics',
        description: 'From risotto to tiramisu.',
        admin: admin2._id,
        members: [admin2._id, userB._id],
        category: 'Italian Cooking',
        isPrivate: false,
        coverImage: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&auto=format&fit=crop&q=60',
        rules: ['No non-Italian fusions']
      },
      {
        name: 'Vegan Power',
        description: 'Plant-based recipes with bold flavors.',
        admin: admin3._id,
        members: [admin3._id, userA._id, userB._id],
        category: 'Vegan',
        isPrivate: false,
        coverImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&auto=format&fit=crop&q=60',
        rules: ['Strictly vegan']
      },
      {
        name: 'Green Bowls',
        description: 'Healthy vegan bowls and quick meals.',
        admin: admin3._id,
        members: [admin3._id],
        category: 'Healthy Eating',
        isPrivate: false,
        coverImage: 'https://images.unsplash.com/photo-1484981138541-b1f3f34e78c8?w=1200&auto=format&fit=crop&q=60',
        rules: ['No animal products']
      },
      {
        name: 'Wok & Ramen',
        description: 'Fast wok dishes, broths, and noodles.',
        admin: admin4._id,
        members: [admin4._id, userA._id],
        category: 'Asian Cuisine',
        isPrivate: false,
        coverImage: 'https://images.unsplash.com/photo-1526312426976-593c2a1a8529?w=1200&auto=format&fit=crop&q=60',
        rules: ['Note allergens where relevant']
      },
      {
        name: 'Dim Sum & More',
        description: 'Bites, dumplings, and weekend feasts.',
        admin: admin4._id,
        members: [admin4._id, userB._id],
        category: 'Asian Cuisine',
        isPrivate: false,
        coverImage: 'https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=1200&auto=format&fit=crop&q=60',
        rules: ['Share steaming tips']
      }
    ];

    const createdGroups = await Group.create(groupsToCreate);

    // Update users with joined groups
    const userJoined = {};
    createdGroups.forEach(g => {
      g.members.forEach(m => {
        userJoined[m] = userJoined[m] || [];
        userJoined[m].push(g._id);
      });
    });
    await Promise.all(Object.entries(userJoined).map(([userId, groupIds]) =>
      User.findByIdAndUpdate(userId, { $addToSet: { joinedGroups: { $each: groupIds } } })
    ));

    console.log(`Created groups: ${createdGroups.length}`);

    // Helper: build ingredients respecting rules
    const dairyIngredients = ['Parmesan', 'Mozzarella', 'Ricotta', 'Butter', 'Milk', 'Cream'];
    const meatIngredients = ['Beef', 'Pork', 'Chicken', 'Lamb', 'Turkey'];

    const isMeatGroup = (group) => group.category === 'BBQ & Grilling' || /Steak/i.test(group.name);
    const isVeganGroup = (group) => group.category === 'Vegan' || group.rules?.some(r => /vegan/i.test(r));

    // Curated food images (Unsplash IDs)
    const IMAGES = {
      steak1: 'photo-1553163147-622ab57be1c7', // steak on grill
      bbq1: 'photo-1550547660-d9450f859349', // bbq spread
      ramen1: 'photo-1526312426976-593c2a1a8529', // ramen bowl
      wok1: 'photo-1512058564366-18510be2db19', // wok stir-fry
      pasta1: 'photo-1521389508051-d7ffb5dc8bbf', // pasta bowl (e.g., carbonara)
      pasta2: 'photo-1525755662778-989d0524087e', // spaghetti (e.g., pesto)
      risotto1: 'photo-1467003909585-2f8a72700288', // risotto-style plate
      pizza1: 'photo-1548365328-5b76f6c7a6c0', // margherita pizza
      dimsum1: 'photo-1526318472351-c75fcf070305', // dim sum
      veganbowl1: 'photo-1512621776951-a57141f2eefd', // vegan bowl
      tofu1: 'photo-1490645935967-10de6ba17061', // tofu bowl
      quinoa1: 'photo-1512621776951-a57141f2eefd', // quinoa/veggie bowl (food)
      cauliflower1: 'photo-1543339308-43f2d6f3ed40', // cauliflower dish
      salad1: 'photo-1504674900247-0877df9cc836', // salad
      dessert1: 'photo-1505253216365-1dce9b3f7e88' // dessert plate
    };
    const pickImage = (id) => `https://images.unsplash.com/${id}?w=1200&auto=format&fit=crop&q=60`;

    // Recipes: mix of group-bound and personal
    console.log('Creating recipes...');

    const recipesPayload = [];
    // For each group admin's groups: create 2-3 recipes honoring rules
    const categoryCounters = {};
    const usedTitles = new Set();
    createdGroups.forEach(group => {
      const cat = group.category;
      categoryCounters[cat] = (categoryCounters[cat] ?? 0) + 1;
      const variant = (categoryCounters[cat] % 2) === 1 ? 'A' : 'B';
      const baseAuthor = [admin1, admin2, admin3, admin4].find(a => String(a._id) === String(group.admin));
      const authorId = baseAuthor?._id || admin1._id;

      // Build ingredient sets
      const baseIngredients = [
        { name: 'Olive Oil', amount: '2', unit: 'tbsp' },
        { name: 'Garlic', amount: '2', unit: 'cloves' },
        { name: 'Salt', amount: '1', unit: 'tsp' },
        { name: 'Black Pepper', amount: '1/2', unit: 'tsp' }
      ];

      const addIfAllowed = (arr, name) => {
        const isDairy = dairyIngredients.includes(name);
        const isMeat = meatIngredients.includes(name);
        if (isVeganGroup(group) && (isDairy || isMeat)) return arr;
        if (isMeatGroup(group) && isDairy) return arr; // no dairy in meat groups
        arr.push({ name, amount: '100', unit: 'g' });
        return arr;
      };

      const ingredients1 = baseIngredients.slice();
      if (group.category === 'Italian Cooking') addIfAllowed(ingredients1, 'Parmesan');
      if (isMeatGroup(group)) addIfAllowed(ingredients1, 'Beef');
      if (isVeganGroup(group)) addIfAllowed(ingredients1, 'Chickpeas');

      const ingredients2 = baseIngredients.slice();
      if (group.category === 'Asian Cuisine') addIfAllowed(ingredients2, 'Chicken');
      if (group.category === 'BBQ & Grilling') addIfAllowed(ingredients2, 'Beef');
      if (isVeganGroup(group)) addIfAllowed(ingredients2, 'Tofu');

      // Build two distinct, real recipes per group category
      let groupRecipes = [];
      switch (group.category) {
        case 'BBQ & Grilling':
          groupRecipes = variant === 'A' ? [
            {
              title: 'Texas-Style Smoked Brisket',
              description: 'Low & slow smoked brisket with peppery bark.',
              author: authorId,
              group: group._id,
              category: 'Main Dish',
              cuisine: 'American',
              difficulty: 'Hard',
              prepTime: 30,
              cookTime: 480,
              servings: 8,
              ingredients: addIfAllowed(ingredients1.slice(), 'Beef'),
              instructions: ['Trim brisket', 'Season generously', 'Smoke at 110°C for 8 hours'],
              images: [pickImage(IMAGES.steak1)],
              tags: ['BBQ']
            },
            {
              title: 'Classic Steakhouse Burger',
              description: 'Juicy grilled burger with toasted buns and pickles.',
              author: authorId,
              group: group._id,
              category: 'Main Dish',
              cuisine: 'American',
              difficulty: 'Easy',
              prepTime: 20,
              cookTime: 10,
              servings: 4,
              ingredients: addIfAllowed(ingredients2.slice(), 'Beef'),
              instructions: ['Form patties', 'Grill 3-4 min per side', 'Assemble and serve'],
              images: [pickImage(IMAGES.bbq1)],
              tags: ['Grilling']
            }
          ] : [
            {
              title: 'Smoky BBQ Ribs',
              description: 'Tender pork ribs with sticky BBQ glaze.',
              author: authorId,
              group: group._id,
              category: 'Main Dish',
              cuisine: 'American',
              difficulty: 'Medium',
              prepTime: 25,
              cookTime: 180,
              servings: 6,
              ingredients: addIfAllowed(ingredients1.slice(), 'Beef'),
              instructions: ['Dry rub', 'Slow-bake then grill', 'Brush with glaze'],
              images: [pickImage(IMAGES.bbq1)],
              tags: ['BBQ']
            },
            {
              title: 'Grilled Skirt Steak Tacos',
              description: 'Charred steak tacos with pico de gallo.',
              author: authorId,
              group: group._id,
              category: 'Main Dish',
              cuisine: 'American',
              difficulty: 'Easy',
              prepTime: 20,
              cookTime: 15,
              servings: 4,
              ingredients: addIfAllowed(ingredients2.slice(), 'Beef'),
              instructions: ['Marinate steak', 'Grill and slice', 'Serve in tortillas'],
              images: [pickImage(IMAGES.steak1)],
              tags: ['Grilling']
            }
          ];
          break;
        case 'Asian Cuisine':
          groupRecipes = variant === 'A' ? [
            {
              title: 'Tonkotsu Ramen',
              description: 'Rich pork broth ramen with chashu and soft egg.',
              author: authorId,
              group: group._id,
              category: 'Main Dish',
              cuisine: 'Asian',
              difficulty: 'Hard',
              prepTime: 40,
              cookTime: 300,
              servings: 4,
              ingredients: addIfAllowed(ingredients1.slice(), 'Chicken'),
              instructions: ['Prepare broth', 'Cook noodles', 'Assemble bowl'],
              images: [pickImage(IMAGES.ramen1)],
              tags: ['Ramen']
            },
            {
              title: 'Chicken Veggie Wok Stir-Fry',
              description: 'Quick wok stir-fry with crunchy vegetables.',
              author: authorId,
              group: group._id,
              category: 'Main Dish',
              cuisine: 'Asian',
              difficulty: 'Easy',
              prepTime: 15,
              cookTime: 15,
              servings: 3,
              ingredients: addIfAllowed(ingredients2.slice(), 'Chicken'),
              instructions: ['Heat wok', 'Stir-fry chicken', 'Add veggies and sauce'],
              images: [pickImage(IMAGES.wok1)],
              tags: ['Wok']
            }
          ] : [
            {
              title: 'Beef Chow Mein',
              description: 'Wok-fried noodles with beef and vegetables.',
              author: authorId,
              group: group._id,
              category: 'Main Dish',
              cuisine: 'Asian',
              difficulty: 'Medium',
              prepTime: 20,
              cookTime: 15,
              servings: 3,
              ingredients: addIfAllowed(ingredients1.slice(), 'Beef'),
              instructions: ['Stir-fry beef', 'Add noodles and sauce'],
              images: [pickImage(IMAGES.wok1)],
              tags: ['Noodles']
            },
            {
              title: 'Miso Ramen with Corn',
              description: 'Savory miso broth with sweet corn and butter.',
              author: authorId,
              group: group._id,
              category: 'Main Dish',
              cuisine: 'Asian',
              difficulty: 'Medium',
              prepTime: 25,
              cookTime: 45,
              servings: 2,
              ingredients: addIfAllowed(ingredients2.slice(), 'Chicken'),
              instructions: ['Simmer miso broth', 'Cook noodles', 'Assemble bowl'],
              images: [pickImage(IMAGES.ramen1)],
              tags: ['Ramen']
            }
          ];
          break;
        case 'Italian Cooking':
          groupRecipes = variant === 'A' ? [
            {
              title: 'Spaghetti Carbonara',
              description: 'Creamy egg-based sauce with guanciale and pecorino.',
              author: authorId,
              group: group._id,
              category: 'Main Dish',
              cuisine: 'Italian',
              difficulty: 'Medium',
              prepTime: 15,
              cookTime: 20,
              servings: 4,
              ingredients: addIfAllowed(ingredients1.slice(), 'Parmesan'),
              instructions: ['Cook pasta al dente', 'Toss with eggs and cheese off heat'],
              images: [pickImage(IMAGES.pasta1)],
              tags: ['Pasta']
            },
            {
              title: 'Penne al Pesto Genovese',
              description: 'Basil pesto with pine nuts and parmigiano.',
              author: authorId,
              group: group._id,
              category: 'Main Dish',
              cuisine: 'Italian',
              difficulty: 'Easy',
              prepTime: 10,
              cookTime: 15,
              servings: 3,
              ingredients: addIfAllowed(ingredients2.slice(), 'Parmesan'),
              instructions: ['Blend pesto', 'Toss with hot pasta and serve'],
              images: [pickImage(IMAGES.pasta2)],
              tags: ['Pasta']
            }
          ] : [
            {
              title: 'Mushroom Risotto',
              description: 'Creamy arborio rice with porcini mushrooms.',
              author: authorId,
              group: group._id,
              category: 'Main Dish',
              cuisine: 'Italian',
              difficulty: 'Medium',
              prepTime: 15,
              cookTime: 30,
              servings: 4,
              ingredients: addIfAllowed(ingredients1.slice(), 'Parmesan'),
              instructions: ['Toast rice', 'Add stock gradually', 'Finish with butter and cheese'],
              images: [pickImage(IMAGES.risotto1)],
              tags: ['Risotto']
            },
            {
              title: 'Margherita Pizza',
              description: 'Tomato, mozzarella, and basil on thin crust.',
              author: authorId,
              group: group._id,
              category: 'Main Dish',
              cuisine: 'Italian',
              difficulty: 'Medium',
              prepTime: 30,
              cookTime: 12,
              servings: 2,
              ingredients: addIfAllowed(ingredients2.slice(), 'Parmesan'),
              instructions: ['Stretch dough', 'Top and bake at high heat'],
              images: [pickImage(IMAGES.pizza1)],
              tags: ['Pizza']
            }
          ];
          break;
        case 'Vegan':
          groupRecipes = variant === 'A' ? [
            {
              title: 'Roasted Veggie Buddha Bowl',
              description: 'Colorful bowl with roasted veggies and tahini.',
              author: authorId,
              group: group._id,
              category: 'Main Dish',
              cuisine: 'Mediterranean',
              difficulty: 'Easy',
              prepTime: 20,
              cookTime: 25,
              servings: 2,
              ingredients: addIfAllowed(ingredients1.slice(), 'Chickpeas'),
              instructions: ['Roast veggies', 'Assemble bowl', 'Drizzle tahini'],
              images: [pickImage(IMAGES.veganbowl1)],
              tags: ['Vegan']
            },
            {
              title: 'Teriyaki Tofu Power Bowl',
              description: 'Seared tofu with teriyaki glaze over greens and grains.',
              author: authorId,
              group: group._id,
              category: 'Main Dish',
              cuisine: 'Asian',
              difficulty: 'Easy',
              prepTime: 15,
              cookTime: 15,
              servings: 2,
              ingredients: addIfAllowed(ingredients2.slice(), 'Tofu'),
              instructions: ['Sear tofu', 'Glaze with teriyaki', 'Serve with vegetables'],
              images: [pickImage(IMAGES.tofu1)],
              tags: ['Vegan']
            }
          ] : [
            {
              title: 'Mediterranean Quinoa Bowl',
              description: 'Quinoa, tomatoes, cucumbers, and herbs with lemon.',
              author: authorId,
              group: group._id,
              category: 'Main Dish',
              cuisine: 'Mediterranean',
              difficulty: 'Easy',
              prepTime: 15,
              cookTime: 15,
              servings: 2,
              ingredients: addIfAllowed(ingredients1.slice(), 'Chickpeas'),
              instructions: ['Cook quinoa', 'Chop veggies', 'Toss with dressing'],
              images: [pickImage(IMAGES.quinoa1)],
              tags: ['Vegan']
            },
            {
              title: 'Roasted Cauliflower Tacos',
              description: 'Spiced roasted cauliflower in warm tortillas.',
              author: authorId,
              group: group._id,
              category: 'Main Dish',
              cuisine: 'American',
              difficulty: 'Easy',
              prepTime: 15,
              cookTime: 20,
              servings: 2,
              ingredients: addIfAllowed(ingredients2.slice(), 'Chickpeas'),
              instructions: ['Roast cauliflower', 'Warm tortillas', 'Assemble tacos'],
              images: [pickImage(IMAGES.cauliflower1)],
              tags: ['Vegan']
            }
          ];
          break;
        case 'Healthy Eating':
          groupRecipes = variant === 'A' ? [
            {
              title: 'Mediterranean Quinoa Bowl',
              description: 'Quinoa, tomatoes, cucumbers, and herbs with lemon.',
              author: authorId,
              group: group._id,
              category: 'Main Dish',
              cuisine: 'Mediterranean',
              difficulty: 'Easy',
              prepTime: 15,
              cookTime: 15,
              servings: 2,
              ingredients: addIfAllowed(ingredients1.slice(), 'Chickpeas'),
              instructions: ['Cook quinoa', 'Chop veggies', 'Toss with dressing'],
              images: [pickImage(IMAGES.quinoa1)],
              tags: ['Healthy']
            },
            {
              title: 'Herby Grilled Chicken Salad',
              description: 'Light grilled chicken over mixed greens and herbs.',
              author: authorId,
              group: group._id,
              category: 'Main Dish',
              cuisine: 'American',
              difficulty: 'Easy',
              prepTime: 15,
              cookTime: 12,
              servings: 2,
              ingredients: addIfAllowed(ingredients2.slice(), 'Chicken'),
              instructions: ['Grill chicken', 'Slice and serve over greens'],
              images: [pickImage(IMAGES.salad1)],
              tags: ['Healthy']
            }
          ] : [
            {
              title: 'Roasted Cauliflower Tacos',
              description: 'Spiced roasted cauliflower in warm tortillas.',
              author: authorId,
              group: group._id,
              category: 'Main Dish',
              cuisine: 'American',
              difficulty: 'Easy',
              prepTime: 15,
              cookTime: 20,
              servings: 2,
              ingredients: addIfAllowed(ingredients1.slice(), 'Chickpeas'),
              instructions: ['Roast cauliflower', 'Warm tortillas', 'Assemble tacos'],
              images: [pickImage(IMAGES.cauliflower1)],
              tags: ['Healthy']
            },
            {
              title: 'Avocado Chickpea Bowl',
              description: 'Protein-packed bowl with avocado and chickpeas.',
              author: authorId,
              group: group._id,
              category: 'Main Dish',
              cuisine: 'Mediterranean',
              difficulty: 'Easy',
              prepTime: 10,
              cookTime: 0,
              servings: 2,
              ingredients: addIfAllowed(ingredients2.slice(), 'Chickpeas'),
              instructions: ['Assemble fresh ingredients in a bowl'],
              images: [pickImage(IMAGES.veganbowl1)],
              tags: ['Healthy']
            }
          ];
          break;
        default:
          groupRecipes = [];
      }

      // Ensure unique titles across the entire seed
      groupRecipes = groupRecipes.map(r => {
        if (usedTitles.has(r.title)) {
          r.title = `${r.title} (${group.name})`;
        }
        usedTitles.add(r.title);
        return r;
      });

      recipesPayload.push(...groupRecipes);
    });

    // Personal recipes for regular users (not tied to groups)
    recipesPayload.push(
      {
        title: 'Mediterranean Salad Bowl',
        description: 'Fresh salad with tomatoes, cucumbers, olives, and herbs.',
        author: userA._id,
        category: 'Side Dish',
        cuisine: 'Mediterranean',
        difficulty: 'Easy',
        prepTime: 10,
        cookTime: 0,
        servings: 2,
        ingredients: [
          { name: 'Tomatoes', amount: '2', unit: 'pcs' },
          { name: 'Cucumbers', amount: '1', unit: 'pc' },
          { name: 'Olives', amount: '10', unit: 'pcs' },
          { name: 'Olive Oil', amount: '2', unit: 'tbsp' },
          { name: 'Lemon Juice', amount: '1', unit: 'tbsp' }
        ],
        instructions: ['Chop vegetables', 'Mix and season'],
        images: [pickImage(IMAGES.salad1)],
        tags: ['Healthy']
      },
      {
        title: 'Chocolate Lava Cake',
        description: 'Gooey-centered mini cakes — perfect dessert.',
        author: userB._id,
        category: 'Dessert',
        cuisine: 'French',
        difficulty: 'Medium',
        prepTime: 20,
        cookTime: 12,
        servings: 4,
        ingredients: [
          { name: 'Dark Chocolate', amount: '200', unit: 'g' },
          { name: 'Butter', amount: '100', unit: 'g' },
          { name: 'Eggs', amount: '3', unit: 'pcs' },
          { name: 'Flour', amount: '60', unit: 'g' },
          { name: 'Sugar', amount: '70', unit: 'g' }
        ],
        instructions: ['Melt chocolate and butter', 'Combine ingredients', 'Bake'],
        images: [pickImage(IMAGES.dessert1)],
        tags: ['Desserts']
      }
    );

    await Recipe.create(recipesPayload);

    // Sample chat messages between users
    await ChatMessage.create([
      { sender: userA._id, receiver: admin1._id, message: 'Hi! Loved your brisket tips.', isRead: true },
      { sender: admin2._id, receiver: userB._id, message: 'Try our new pasta challenge!', isRead: false }
    ]);

    console.log('✅ Clean seed data created successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: 6 (2 regular, 4 group admins)`);
    console.log(`🏘️ Groups: ${createdGroups.length} (2 per admin)`);
    console.log(`📖 Recipes: ${recipesPayload.length}`);
    console.log('💬 Chat messages: 2');
    
    console.log('\n🔑 Login credentials:');
    console.log('Regular: michael@test.com / password123');
    console.log('Regular: noa@test.com / password123');
    console.log('Group admin: bbq_admin@test.com / password123');
    console.log('Group admin: italian_admin@test.com / password123');
    console.log('Group admin: vegan_admin@test.com / password123');
    console.log('Group admin: asian_admin@test.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

cleanSeed();
