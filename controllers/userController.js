const { User, Thought } = require('../models');

module.exports = {
    //get all users
    async getUsers(req, res) {
        try {
            const users = await User.find();
            res.json(users);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    //get a single user
    async getSingleUser(req, res) {
        try {
            const user = await User.findOne({ _id: req.params.userId })
                .select('-__v');

                if (!user) {
                    return res.status(404).json({ message: 'No user with that ID'});
                }

                res.json(user);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    //create a new user
    async createUser(req, res) {
        try {
          const user = await User.create(req.body);
          res.json(user);
        } catch (err) {
          res.status(500).json(err);
        }
      },
    //update an existing user
    async updateUser(req, res) {
        try {
            const user = await User
            .findOneAndUpdate(
                { _id: req.params.userId},
                { name: req.body.username },
                { new: true} );
            res.status(200).json(user);
            console.log(`Updated user`);
        } catch (err) {
            console.log('Something went wrong');
            res.status(500).json({ message: 'Something went wrong'});
        }
    },
    //delete a user and associated thoughts
    async deleteUser(req, res) {
        try {
          const user = await User.findOneAndDelete({ _id: req.params.userId });
    
          if (!user) {
            return res.status(404).json({ message: 'No user with that ID' });
          }
    
          await Thought.deleteMany({ _id: { $in: user.thoughts } });
          res.json({ message: 'User and associated thoughts deleted!' })
        } catch (err) {
          res.status(500).json(err);
        }
      },
    //add friend to user
    async addFriend(req, res) {
        try {
            const user = await User.findOneAndUpdate(
                { _id: req.params.userId },
                { $addToSet: { friends: req.body } },
                { runValidators: true, new: true }
            );

            if (!user) {
                return res
                    .status(404)
                    .json({ message: 'No user found with that ID'})
            }

            res.json(user);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    // remove friend from user
    async removeFriend(req, res) {
        try {
            const user = await User.findOneAndUpdate(
                { _id: req.params.userId },
                { $pull: { friends: { friendId: req.params.friendId } } },
                { runValidators: true, new: true }
            );

            if (!user) {
                return res
                    .status(404)
                    .json({ message: 'No user found with that ID'});
            }

            res.json(user);
        } catch (err) {
            res.status(500).json(err);
        }
    }
};
