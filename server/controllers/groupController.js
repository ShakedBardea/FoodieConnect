const Group = require('../models/Group');
const User = require('../models/User');
const Recipe = require('../models/Recipe');

// @desc    Create new group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res) => {
  try {
    const group = await Group.create({
      ...req.body,
      admin: req.user._id,
      members: [req.user._id]
    });

    // Add group to user's joinedGroups and ensure role is group_admin (use doc.save to avoid schema issues)
    const creator = await User.findById(req.user._id);
    if (creator) {
      if (!creator.joinedGroups.map(String).includes(String(group._id))) {
        creator.joinedGroups.push(group._id);
      }
      if (creator.role !== 'group_admin') {
        creator.role = 'group_admin';
      }
      await creator.save();
    }

    await group.populate('admin', 'username fullName profilePicture');
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all groups with filters
// @route   GET /api/groups
// @access  Public
const getGroups = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    
    let query = {};

    // Only show public groups unless user is authenticated
    if (!req.user) {
      query.isPrivate = false;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const groups = await Group.find(query)
      .populate('admin', 'username fullName profilePicture')
      .select('-posts') // Don't include posts in list view
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Group.countDocuments(query);

    res.json({
      groups,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Advanced search for groups (SEARCH #2 with 5+ parameters)
// @route   GET /api/groups/search
// @access  Public
const searchGroups = async (req, res) => {
  try {
    const {
      category,        // Parameter 1: Category
      minMembers,      // Parameter 2: Minimum number of members
      maxMembers,      // Parameter 3: Maximum number of members
      isPrivate,       // Parameter 4: Private or Public
      search,          // Parameter 5: Free text search in name/description
      page = 1,
      limit = 12
    } = req.query;

    let query = {};

    // Parameter 1: Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Parameter 2 & 3: Member count range
    if (minMembers || maxMembers) {
      // We'll use aggregation for this
      const groups = await Group.aggregate([
        {
          $addFields: {
            memberCount: { $size: '$members' }
          }
        },
        {
          $match: {
            ...(minMembers && { memberCount: { $gte: parseInt(minMembers) } }),
            ...(maxMembers && { memberCount: { $lte: parseInt(maxMembers) } }),
            ...(category && category !== 'All' && { category }),
            ...(isPrivate !== undefined && { isPrivate: isPrivate === 'true' }),
            ...(search && {
              $or: [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
              ]
            })
          }
        },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: parseInt(limit) }
      ]);

      // Populate admin
      await Group.populate(groups, {
        path: 'admin',
        select: 'username fullName profilePicture'
      });

      const totalCount = await Group.aggregate([
        {
          $addFields: {
            memberCount: { $size: '$members' }
          }
        },
        {
          $match: {
            ...(minMembers && { memberCount: { $gte: parseInt(minMembers) } }),
            ...(maxMembers && { memberCount: { $lte: parseInt(maxMembers) } }),
            ...(category && category !== 'All' && { category }),
            ...(isPrivate !== undefined && { isPrivate: isPrivate === 'true' }),
            ...(search && {
              $or: [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
              ]
            })
          }
        },
        { $count: 'total' }
      ]);

      const total = totalCount[0]?.total || 0;

      return res.json({
        groups,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
        filters: { category, minMembers, maxMembers, isPrivate, search }
      });
    }

    // Parameter 4: Privacy filter
    if (isPrivate !== undefined) {
      query.isPrivate = isPrivate === 'true';
    }

    // Parameter 5: Text search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // If no member count filters, use simple query
    const groups = await Group.find(query)
      .populate('admin', 'username fullName profilePicture')
      .select('-posts')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Group.countDocuments(query);

    res.json({
      groups,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count,
      filters: { category, minMembers, maxMembers, isPrivate, search }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get group by ID
// @route   GET /api/groups/:id
// @access  Public (for public groups) / Private (for private groups - members only)
const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('admin', 'username fullName profilePicture')
      .populate('members', 'username fullName profilePicture')
      .populate('pendingRequests', 'username fullName profilePicture')
      .populate('posts.author', 'username fullName profilePicture')
      .populate('posts.recipe', 'title images')
      .populate('posts.comments.user', 'username profilePicture');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if private and user is not a member
    if (group.isPrivate && req.user) {
      const isMember = group.members.some(member => member._id.toString() === req.user._id.toString());
      const isAdmin = group.admin._id.toString() === req.user._id.toString();
      
      if (!isMember && !isAdmin) {
        return res.status(403).json({ message: 'This is a private group' });
      }
    } else if (group.isPrivate && !req.user) {
      return res.status(401).json({ message: 'Authentication required for private groups' });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update group
// @route   PUT /api/groups/:id
// @access  Private (admin only)
const updateGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is group admin
    const isGroupAdmin = group.admin.toString() === req.user._id.toString();
    const isGroupAdminRole = req.user.role === 'group_admin';
    
    if (!isGroupAdmin && !isGroupAdminRole) {
      return res.status(403).json({ message: 'Not authorized to update this group' });
    }

    const updatedGroup = await Group.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('admin', 'username fullName profilePicture');

    res.json(updatedGroup);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Private (admin only)
const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is group admin
    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this group' });
    }

    // Get all members before deleting
    const groupMembers = group.members || [];
    
    // Remove group from all members' joinedGroups
    await User.updateMany(
      { joinedGroups: group._id },
      { $pull: { joinedGroups: group._id } }
    );

    await group.deleteOne();
    
    // Notify all group members that the group was deleted
    const io = req.app.get('io');
    if (io) {
      groupMembers.forEach(memberId => {
        io.to(memberId.toString()).emit('group_deleted', {
          groupId: group._id,
          groupName: group.name,
          message: `The group "${group.name}" has been deleted by the administrator.`
        });
      });
    }
    
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Join group (public) or request to join (private)
// @route   POST /api/groups/:id/join
// @access  Private
const joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if already a member
    if (group.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already a member of this group' });
    }

    if (group.isPrivate) {
      // Add to pending requests
      if (!group.pendingRequests.includes(req.user._id)) {
        group.pendingRequests.push(req.user._id);
        await group.save();
        
        // Send notification to group admin via Socket.IO
        const io = req.app.get('io');
        if (io) {
          io.emit('join_group_request', {
            groupId: group._id,
            groupName: group.name,
            userId: req.user._id,
            userName: req.user.username
          });
        }
        
        res.json({ message: 'Join request sent. Waiting for approval.' });
      } else {
        res.status(400).json({ message: 'Join request already pending' });
      }
    } else {
      // Public group - join immediately
      group.members.push(req.user._id);
      await group.save();

      // Add to user's joinedGroups
      await User.findByIdAndUpdate(req.user._id, {
        $push: { joinedGroups: group._id }
      });

      res.json({ message: 'Joined group successfully', members: group.members });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Leave group
// @route   POST /api/groups/:id/leave
// @access  Private
const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // If admin is leaving, transfer ownership to first member
    if (group.admin.toString() === req.user._id.toString()) {
      if (group.members.length > 1) {
        // Transfer to first member (excluding the admin)
        const newAdmin = group.members.find(id => id.toString() !== req.user._id.toString());
        group.admin = newAdmin;
        group.members = group.members.filter(id => id.toString() !== newAdmin.toString());
      } else {
        // No one else in group, delete the group
        await Group.findByIdAndDelete(group._id);
        return res.json({ message: 'Group deleted as admin was the only member' });
      }
    }

    group.members = group.members.filter(id => id.toString() !== req.user._id.toString());
    await group.save();

    // Remove from user's joinedGroups
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { joinedGroups: group._id }
    });

    res.json({ message: 'Left group successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Approve join request
// @route   POST /api/groups/:id/approve/:userId
// @access  Private (group admin/system admin only)
const approveJoinRequest = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check authorization
    const isGroupAdmin = group.admin.toString() === req.user._id.toString();
    const isGroupAdminRole = req.user.role === 'group_admin';
    
    if (!isGroupAdmin && !isGroupAdminRole) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const userId = req.params.userId;

    // Remove from pending and add to members
    group.pendingRequests = group.pendingRequests.filter(id => id.toString() !== userId);
    group.members.push(userId);
    await group.save();

    // Add to user's joinedGroups
    await User.findByIdAndUpdate(userId, {
      $push: { joinedGroups: group._id }
    });

    res.json({ message: 'User approved and added to group' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reject join request
// @route   POST /api/groups/:id/reject/:userId
// @access  Private (group admin/system admin only)
const rejectJoinRequest = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check authorization
    const isGroupAdmin = group.admin.toString() === req.user._id.toString();
    const isGroupAdminRole = req.user.role === 'group_admin';
    
    if (!isGroupAdmin && !isGroupAdminRole) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const userId = req.params.userId;
    group.pendingRequests = group.pendingRequests.filter(id => id.toString() !== userId);
    await group.save();

    res.json({ message: 'Join request rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create post in group
// @route   POST /api/groups/:id/posts
// @access  Private (members only)
const createGroupPost = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member
    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Only group members can post' });
    }

    let recipeId = req.body.recipe;

    // If creating a new recipe within the group post
    if (req.body.newRecipe) {
      const Recipe = require('../models/Recipe');
      const newRecipe = await Recipe.create({
        ...req.body.newRecipe,
        author: req.user._id
      });
      recipeId = newRecipe._id;
    }

    const post = {
      author: req.user._id,
      content: req.body.content,
      images: req.body.images || [],
      recipe: recipeId
    };

    group.posts.unshift(post);
    await group.save();

    await group.populate('posts.author', 'username fullName profilePicture');
    await group.populate('posts.recipe', 'title images');
    res.status(201).json(group.posts[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete post from group
// @route   DELETE /api/groups/:id/posts/:postId
// @access  Private (post author, admin)
const deleteGroupPost = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const post = group.posts.id(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check authorization
    const isAuthor = post.author.toString() === req.user._id.toString();
    const isGroupAdmin = group.admin.toString() === req.user._id.toString();
    const isSystemAdmin = req.user.role === 'admin';
    const isGroupAdminRole = req.user.role === 'group_admin';

    if (!isAuthor && !isGroupAdmin && !isSystemAdmin && !isGroupAdminRole) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    post.deleteOne();
    await group.save();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create recipe in group
// @route   POST /api/groups/:id/recipes
// @access  Private (members only)
const createGroupRecipe = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member or admin
    if (!group.members.includes(req.user._id) && group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only group members or admin can create recipes' });
    }

    const Recipe = require('../models/Recipe');
    const recipe = await Recipe.create({
      ...req.body,
      author: req.user._id,
      group: group._id
    });

    await recipe.populate('author', 'username fullName profilePicture');
    res.status(201).json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// moderation endpoints removed - not required

// @desc    Get user's feed - posts from groups, personal recipes, and friends' recipes
// @route   GET /api/groups/feed
// @access  Private
const getUserFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get user's friends
    const user = await User.findById(req.user._id).populate('friends.user', '_id');
    const friendIds = user.friends
      .filter(friendship => friendship.status === 'accepted')
      .map(friendship => friendship.user._id);

    // Get all groups the user is a member of
    const userGroups = await Group.find({ members: req.user._id })
      .select('_id name');

    let allPosts = [];

    // 1. Get recipes from user's groups (created by group admins)
    if (userGroups.length > 0) {
      const groupIds = userGroups.map(group => group._id);
      
      // Get group recipes (recipes created by group admins for their groups)
      const Recipe = require('../models/Recipe');
      const groupRecipes = await Recipe.find({ 
        group: { $in: groupIds }
      })
      .populate('author', 'username fullName profilePicture')
      .populate('group', 'name')
      .populate('likes', 'username fullName profilePicture')
      .populate('comments.user', 'username fullName profilePicture')
      .sort({ createdAt: -1 });

      groupRecipes.forEach(recipe => {
        allPosts.push({
          _id: `group_recipe_${recipe._id}`,
          recipe: recipe,
          group: {
            _id: recipe.group._id,
            name: recipe.group.name
          },
          createdAt: recipe.createdAt,
          type: 'group_recipe'
        });
      });
    }

    // 2. Get user's own recipes (not private) - only recent ones (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Get recipe IDs that are already in group recipes to avoid duplicates
    const existingRecipeIds = allPosts
      .filter(post => post.recipe && post.recipe._id)
      .map(post => post.recipe._id.toString());
    
    const userRecipes = await Recipe.find({ 
      author: req.user._id,
      createdAt: { $gte: sevenDaysAgo },
      _id: { $nin: existingRecipeIds } // Exclude recipes already in group recipes
    })
    .populate('author', 'username fullName profilePicture')
    .populate('likes', 'username fullName profilePicture')
    .populate('comments.user', 'username fullName profilePicture')
    .sort({ createdAt: -1 });

    userRecipes.forEach(recipe => {
      allPosts.push({
        _id: `recipe_${recipe._id}`,
        recipe: recipe,
        createdAt: recipe.createdAt,
        type: 'personal_recipe'
      });
    });

    // 3. Get friends' recipes (not private) - only recent ones (last 7 days)
    if (friendIds.length > 0) {
      // Update existing recipe IDs to include user's recipes too
      const allExistingRecipeIds = allPosts
        .filter(post => post.recipe && post.recipe._id)
        .map(post => post.recipe._id.toString());
      
      const friendsRecipes = await Recipe.find({ 
        author: { $in: friendIds },
        _id: { $nin: allExistingRecipeIds } // Exclude recipes already in posts
      })
      .populate('author', 'username fullName profilePicture')
      .populate('likes', 'username fullName profilePicture')
      .populate('comments.user', 'username fullName profilePicture')
      .sort({ createdAt: -1 });

      friendsRecipes.forEach(recipe => {
        allPosts.push({
          _id: `recipe_${recipe._id}`,
          recipe: recipe,
          createdAt: recipe.createdAt,
          type: 'friend_recipe'
        });
      });
    }

    // Sort by creation date (newest first)
    allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const totalPosts = allPosts.length;
    const paginatedPosts = allPosts.slice(skip, skip + limit);
    const totalPages = Math.ceil(totalPosts / limit);

    res.json({
      posts: paginatedPosts,
      totalPosts,
      currentPage: page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      userGroups: userGroups.map(g => ({ _id: g._id, name: g.name }))
    });
  } catch (error) {
    console.error('Error in getUserFeed:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Like/unlike a post in group
// @route   POST /api/groups/:id/posts/:postId/like
// @access  Private (members only)
const togglePostLike = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member
    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Only group members can like posts' });
    }

    const post = group.posts.id(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id;
    const likeIndex = post.likes.findIndex(like => like.toString() === userId.toString());

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push(userId);
    }

    await group.save();

    res.json({ 
      message: likeIndex > -1 ? 'Post unliked' : 'Post liked',
      likesCount: post.likes.length,
      isLiked: likeIndex === -1
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add comment to post in group
// @route   POST /api/groups/:id/posts/:postId/comments
// @access  Private (members only)
const addPostComment = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member
    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Only group members can comment' });
    }

    const post = group.posts.id(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      user: req.user._id,
      text: req.body.text
    };

    post.comments.push(comment);
    await group.save();

    // Populate the new comment
    await group.populate('posts.comments.user', 'username profilePicture');

    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete comment from post in group
// @route   DELETE /api/groups/:id/posts/:postId/comments/:commentId
// @access  Private (comment author, admin)
const deletePostComment = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const post = group.posts.id(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check authorization
    const isCommentAuthor = comment.user.toString() === req.user._id.toString();
    const isGroupAdmin = group.admin.toString() === req.user._id.toString();
    const isSystemAdmin = req.user.role === 'admin';
    const isGroupAdminRole = req.user.role === 'group_admin';

    if (!isCommentAuthor && !isGroupAdmin && !isSystemAdmin && !isGroupAdminRole) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    comment.deleteOne();
    await group.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user's groups
// @route   GET /api/groups/user/my-groups
// @access  Private
const getUserGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate('admin', 'username fullName')
      .select('-posts')
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get pending join requests for a group
// @route   GET /api/groups/:id/pending-requests
// @access  Private (group admin/system admin only)
const getPendingRequests = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check authorization
    const isGroupAdmin = group.admin.toString() === req.user._id.toString();
    const isSystemAdmin = req.user.role === 'admin';
    const isGroupAdminRole = req.user.role === 'group_admin';
    
    if (!isGroupAdmin && !isSystemAdmin && !isGroupAdminRole) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get pending requests with user details
    const pendingRequests = await User.find({ _id: { $in: group.pendingRequests } })
      .select('username fullName bio profilePicture createdAt');

    res.json({ requests: pendingRequests });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Remove member from group
// @route   DELETE /api/groups/:id/members/:userId
// @access  Private (group admin/system admin only)
const removeMember = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check authorization
    const isGroupAdmin = group.admin.toString() === req.user._id.toString();
    const isSystemAdmin = req.user.role === 'admin';
    const isGroupAdminRole = req.user.role === 'group_admin';
    
    if (!isGroupAdmin && !isSystemAdmin && !isGroupAdminRole) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const userId = req.params.userId;

    // Cannot remove the group admin
    if (group.admin.toString() === userId) {
      return res.status(400).json({ message: 'Cannot remove group admin' });
    }

    // Remove from members
    group.members = group.members.filter(id => id.toString() !== userId);
    await group.save();

    // Remove from user's joinedGroups
    await User.findByIdAndUpdate(userId, {
      $pull: { joinedGroups: group._id }
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


module.exports = {
  createGroup,
  getGroups,
  searchGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  joinGroup,
  leaveGroup,
  getPendingRequests,
  approveJoinRequest,
  rejectJoinRequest,
  removeMember,
  createGroupPost,
  deleteGroupPost,
  createGroupRecipe,
  getUserFeed,
  togglePostLike,
  addPostComment,
  deletePostComment,
  getUserGroups
};
