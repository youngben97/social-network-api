const { Thought, User } = require('../models');

module.exports = {
    //get all thoughts
    async getThoughts(req, res) {
        try {
            const thoughts = await Thought.find();
            res.json(thoughts);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    // gat a single thought
    async getSingleThought(req, res) {
        try {
            const thought = await Thought.findOne({ _id: req.params.thoughtId})
                .select('-__v');

                if (!thought) {
                    return res.status(404).json({ message: 'No user with that ID'});
                }

                res.json(thought);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    // create a thought
    async createThought(req, res) {
        try {
            const { thoughtText, username } = req.body;

            let user = await User.findOne({ username });
            if (!user) {
                return res
                    .status(404)
                    .json({ message: 'No user found with that ID'})
            }

            const thought = new Thought({
                thoughtText,
                username: user.username,
                createdAt: new Date()
            });

            await thought.save();

            user.thoughts.push(thought._id);

            await user.save();
            
            res.status(200).json(thought);
    } catch (err) {
        console.error(err)
        res.status(500).json(err)
    }
    },
    //update an existing thought
    async updateThought(req, res) {
        try {
            const thought = await Thought.findOneAndUpdate(
                { _id: req.params.thoughtId},
                { thoughtText: req.body.thoughtText},
                { new: true });
            res.status(200).json(thought);
            console.log(`Updated thought`);
        } catch (err) {
            console.log('Something went wrong');
            res.status(500).json({ message: 'Something went wrong'});
        }
    },
    //delete a thought and associated reactions
    async deleteThought(req, res) {
        try {
            const thought = await Thought.findOneAndDelete({ _id: req.params.thoughtId });

            if (!thought) {
                return res.status(404).json({ message: 'No thought with that ID '});
            }

            await Thought.deleteMany({ _id: { $in: thought.reactions } });
            res.json({ message: 'Thought and associated reactions deleted'})
        } catch (err) {
            res.status(500).json(err);
        }
    },
    //add reaction to thought
    async addReaction(req, res) {
        try {
            const thought = await Thought.findOneAndUpdate(
                { _id: req.params.thoughtId},
                { $addToSet: { reactions: req.body } },
                { runValidators: true, new: true }
            );

            if (!thought) {
                return res
                    .status(404)
                    .json({ message: 'No thought found with that ID'})

            }

            res.json(thought);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    //remove reaction from thought
    async removeReaction(req, res) {
        try {
            const thought = await Thought.findOneAndUpdate(
                { _id: req.params.thoughtId },
                { $pull: { reactions: { reactionId: req.params.reactionId } } },
                { runValidators: true, new: true}
            );

            if (!thought) {
                return res
                    .status(400)
                    .json({ message: 'No thought found with that ID'})
            }

            res.json(thought);
        } catch (err) {
            res.status(500).json(err);
        }
    }
};