---
title: "Designing Twitter\u0027s Trending Hashtags Solution"
description: 'This description will be used for the article listing and search results on Google.'
date: '2021-11-30'
banner:
    src: 'hashtag.jpg'
    alt: 'Hashtag'
    caption: ''
categories:
    - 'Jam Session'
keywords:
    - 'Machine Learning System Design'
    - 'Jam Session'
    - 'Blog Post'
---

## Table of Contents
* [[intro]](#intro)
* [Motivations](#motivations)
* [Objectives](#objectives)
  + [Business Objectives](#business-objectives)
  + [ML Objectives](#ml-objectives)
* [Problem Definition](#problem-definition)
  + [Scoping](#scoping)
  + [Definition of “Trending”](#definition-of-trending)
    - [Exponential decay after events](#exponential-decay-after-events)
  + [UI/UX](#ui-ux)
  + [System Evaluation](#system-evaluation)
* [Solution Development](#solution-development)
  + [Data](#data)
  + [Attempt 1: Rule-based System](#attempt-1-rule-based-system)
    - [Limitations of this system](#limitations-of-this-system)
  + [Attempt 2: Machine Learning System](#attempt-2-machine-learning-system)
    - [Topic Modeling](#topic-modeling)
    - [Pandemic of Bots](#pandemic-of-bots)
    - [NSFW](#nsfw)
  + [Attempt 3: Beyond MVP](#attempt-3-beyond-mvp)
  + [Attempt 4: From Reactive to Proactive](#attempt-4-from-reactive-to-proactive)
* [Reflections & Broader Impact](#reflections-and-broader-impact)
* [References](#references)


## [intro] <a name="intro"></a>

This is an ongoing community project so it’s not perfect. Feedback and contributions are much appreciated!

Authors:

* Chloe He
* Ammar Asmro
* Goku Mohandas
* Clara Matos
* Eugene Yan
* Aditya Soni
* Aniket Maurya
* Han-chung Lee
* Chip Huyen


## Motivations <a name="motivations"></a>

In today’s world, we go to social media to learn what is happening in the world, and that’s why most people use our Twitter-like platform, Chipper. Our users use hashtags to link their posts to topics. Because there are a lot of hashtags (including hashtags published by bots), it can be tricky for users to find what is trending on the platform.

Improving the discoverability of trending topics increases user engagement and will ultimately increase our ads revenue. We’ve manually curated and shown certain topics when we know they are trending, like #Tokyo2021 or #Election2020, and these manual efforts have helped drive engagement not only around these hashtags but across the entire platform.

Due to the manual process, we’ve missed out on a lot of trends. For example, we totally missed out on the [GameStop short squeeze](https://en.wikipedia.org/wiki/GameStop_short_squeeze) because we were too late! We want to create some kind of automated process that would detect trends and show the relevant ones to users.

This feature can also help us (platform developers) to understand what conversations are happening on the platform, helping us stay relevant and appropriately respond to user needs.


## Objectives <a name="objectives"></a>

There are business objectives and technical objectives: different stakeholders care about different objectives. Your CEO might not care that your system has a 90% accuracy on past held-out test sets, but they will (should) very likely express interest if your system can boost the revenue by 10%.


### Business Objectives <a name="business-objectives"></a>

We’ll measure the success of the project based on the engagement of users who are shown trending hashtags computed by our algorithm compared to those who are shown the manually curated hashtags. Engagement can be measured through user interactions, such as:


* Click-through-rate (CTR): % of users who see a trending hashtag clicks on it.
* Interactions with the hashtag: views, likes, comments, and shares of tweets containing that hashtag
* Usage of the hashtag: whether a user uses the hashtag shown to them in their future tweets.
* The user’s engagement with the platform overall.

**Warning**: when measuring the engagement with a hashtag, we can’t compare users who are shown the hashtag and those who aren’t shown the hashtag. The act of showing a hashtag is trending to users will increase users’ engagement to that hashtag. If our algorithm predicts a hashtag to be trending and we show this hashtag to users and it indeed gets a lot of users’ engagement, it doesn’t mean that this hashtag is good.

From a user experience perspective, we want them to see hashtags as soon as they start trending. However, computing trending hashtags every second can be expensive, so **we want to balance performance gain & cost**. If computing trending hashtags every minute costs 100x more and only improves engagement 1% compared to doing it every hour, we might want to do every hour. 


### ML Objectives <a name="ml-objectives"></a>

We would like to build a machine learning system to score hashtags with the following requirements:



* **Accuracy**: trending hashtags identified by our system should have xx more click-through-rate than manually curated hashtags.
* **Latency**:  xxx ms latency. For reference, [Gmail’s Smart Compose requires the latency to be within 100ms for the user not to notice any delays](https://ai.googleblog.com/2018/05/smart-compose-using-neural-networks-to.html). 
* **Non-blocking**: doesn’t affect existing features on the platform, such as slowing down users’ homepage loading.


## Problem Definition <a name="problem-definition"></a>


### Scoping <a name="scoping"></a>

To simplify the problem for the MVP, we’ll focus on detecting trending hashtags as opposed to identifying trending topics. Hashtags can be identified using regular expressions, allowing us to focus our attention on detecting trending hashtags. In future releases, we can extend our methodology to the trending topics but note that these have the added challenge of identifying common tokens (much more compute-intensive).


### Definition of “Trending” <a name="definition-of-trending"></a>

Before diving into the machine learning components, we should always clarify the problem and define relevant terms. In this case, we want to know: what does it mean for a hashtag to be “trending”?

For a hashtag to be considered trending, it shouldn’t just be used often, but its usage should be increasing significantly more than others over a certain period of time. For example, #BTS may be used a lot every day throughout the past 2 years, whereas #Olympics is only used a lot in the days leading up to and during the Olympics; the latter is considered a trending hashtag, but the former isn’t.

A second differentiation we need to make is between trending hashtags and news. Growth in a specific day or week can indicate trendiness, whereas growth over a long period of time is likely news on repeat (think #tesla). This means that we need to narrow our window to look at volume in the last X hours/days.

What if a rare hashtag suddenly gets mentioned more - e.g. usually it’s been mentioned only once but the last hour, it gets mentioned 100 times (10000% growth!) - should this hashtag be considered “trending”? You would probably think no. This tells us that, not only do we want to consider change over time, but we should also enforce some type of thresholding (e.g. a hashtag needs to appear at least X times to be considered trending).

There is unfortunately not a clear-cut definition for “trending”. Different platforms likely define them differently, based on user volume, feature, etc.


#### Exponential decay after events <a name="exponential-decay-after-events"></a>

Suppose there's some popular event happening right now and a lot of people are talking about it. As soon as that particular event is over, the amount of new posts using these hashtags might decrease "dramatically". To overcome this particular behaviour, a simple exponential decay function can be used to define TTL (Time to Live) for such tags. So this will ensure that the hashtag that was of interest is still "trending" for some time.

**Note**: We’d love to see examples/case studies where sites actually measure TTL for trending hashtags.


### UI/UX <a name="ui-ux"></a>

A dedicated space on the UI will be used to display a list of trending hashtags, ranked from most popular to least. A user can click on one of these tags to get a list of tweets/posts that mention it. We don’t want to overwhelm users with too many trending hashtags. Twitter currently shows 4 trending hashtags at a time. We can also experiment with different numbers of hashtags on the UI.


### System Evaluation <a name="system-evaluation"></a>

Finding appropriate ways to evaluate the model is necessary not only for developing the model itself, but also for helping gain approval for a budget in an actual company.

At the end of the day, from the company’s perspective, it’s the business metrics that matter to them. While business metrics may be context-dependent, it’s usually helpful to ask the questions: Have sales and revenue gone up? Have costs gone down? In the case with Chipper, we want to show that this machine learning system is able to increase the discoverability of trending topics, thereby increasing user engagement, ultimately leading to increase in ads revenue. So ads revenue will be the ultimate metric that we want to optimize for.

The trickier part is often translating these business objectives into meaningful model metrics and finding appropriate means to measure these model metrics. For example, how do we measure user engagement and discoverability of trending topics?

The first stage of model evaluation is offline evaluation: done using a held-out test set. We can collect hashtags from the past, use them to train a model to predict which hashtags are trending, then evaluate model accuracy by comparing the set of predicted trending hashtags against manually curated hashtags.

The next stage of evaluation would be online evaluation: conduct A/B testing (which would require some kind of end-to-end utility) in production. We can randomly assign a small subset of users (e.g. 1% of traffic) to see the manually curated hashtags vs. hashtags generated by the machine learning system and compare user engagement (which can be measured with impressions, clicks, click-through rate, etc). This is an important test as our offline metrics don’t capture the effects of the model in the online environment.


## Solution Development <a name="solution-development"></a>


### Data <a name="data"></a>

We’ll use historical data from the year 2020 on our platform as the training/evaluating data for our algorithms. We’ll use RegEx to identify hashtags in tweets. We’ll randomly sample approximately 1% of all tweets with hashtags from 2020, which should give us about xxxxxxx tweets and xxxxx hashtags. We’ll remove all hashtags that appear less than xx times (or x percentile).

We’ll have a team of experts to manually curate and label what hashtags should have been trending and the time window each hashtag should have been trending using:



* Our understanding of what happened in 2020.
* Number of times a hashtag is used over 1-hour time windows.
    * Some trends take longer than hashtag refresh periods (hourly) so we should use a weighted average approach over a longer window of time while giving more weight to recent events.
    * Quantity the influence of users who use the hashtag (e.g. using followers count). 
* Number of engagement tweets containing a hashtag has.


### Attempt 1: Rule-based System <a name="attempt-1-rule-based-system"></a>

We want to start with a reasonably simple solution with some assumptions first and iterate on it. Trending hashtags might be different in different countries, so in Attempt 1 of the solution, we constrain the ML system to one single country (e.g. the US) to allow us to focus on finding a single set of trending hashtags for every user.

We can start with a naive count-based method that determines whether a hashtag is trending based on the number of times it’s used over a specified time window (e.g. the last hour) and how much this number has changed over a period (e.g. the last week). There are two values to consider: the time window length, and the period.

**Period length**: Each day, there are hundreds of thousands, if not millions of hashtags being used. For comparison, in 2020, the  average hashtags tweeted daily on Twitter is [125 million](https://comparecamp.com/hashtags-statistics/) (the source might be questionable …). Computing the counts and reporting the top-k (the top-k problem) for a large number of hashtags is expensive. A long period gives us more data to better calculate what’s trending, but it also contains more hashtags, making the computation slower and more expensive. We might want to experiment with the accuracy vs. cost/speed tradeoff.

**Time window**: How often should we update this list? Frequent updates are expensive; if we don’t update it frequently enough, we might 1) create delays and 2) miss some trends that happen really quickly.

This also brings us to the question of online vs. batch processing: online processing is expensive to implement. It requires both compute and human resources (people have to go on call). While, in a perfect world, we would love trending hashtags to be updated in real time, batch processing is a more realistic starting point (to both test out the feature and save money). We can, for example, update this list every hour, in which case we would just need to make sure that a single run of the system completes within an hour. This places less time constraint on the overall system as well.


#### Limitations of this system <a name="limitations-of-this-system"></a>

First, we can imagine that there are a large number of hashtags that mean similar things or reference similar news. It wouldn’t be interesting to users if the trending hashtags we display are all centered around one event, especially if the users have no interest in that particular event. We will need to use some kind of NLP technique to compare the meaning of these hashtags. 

Second, the platform struggles specifically with an overabundance of bots. The naive count-based solution unfortunately doesn’t resolve the problem of bots, if not making it easier for them to take over the trending hashtags page.

Third, perhaps not every hashtag use should carry the same weight. For example, a hashtag used in a trusted authority or public figure’s post might carry more weight (although at the same time, we don’t want already popular users to be the only ones who can create trends, which means that we’d have to develop some kind of seeding mechanism). Similarly, what if some of the trending hashtags are actually offensive or involve false information / fake news? Would it be a good idea to display these not safe for work (NSFW) hashtags without any filtering? We want to think carefully about the potential consequences of these trending hashtags. If we display NSFW hashtags, we can potentially propagate the spread of misinformation, racism, misogyny, etc. This might actually lead to a poor user experience and deter some users (and hurt our reputation and what we stand for!).


### Attempt 2: Machine Learning System <a name="attempt-2-machine-learning-system"></a>

For the three reasons mentioned above, a naive count-based solution is unfortunately not enough. In Attempt 2, we start thinking about how machine learning can be used to solve these problems.


#### Topic Modeling <a name="topic-modeling"></a>

A naive way of implementing topic modeling would be to assume that hashtags that appear together in a post are similar. More advanced NLP techniques would be helpful to allow us to compare the meaning of different hashtags. We can, for example, train a model to represent the hashtags as feature vectors (i.e. hashtag2vec) and use unsupervised learning to group together hashtags that are close to each other in the latent space. We then choose to only display one of those semantically similar hashtags, or display them as a group.


#### Pandemic of Bots <a name="pandemic-of-bots"></a>

[Pandemic of Bots: Half of Twitter trends are fake, says new study](https://www.dailysabah.com/life/science/pandemic-of-bots-half-of-twitter-trends-are-fake-says-new-study) 

[How much to fake a trend on Twitter? In one country, about £150](https://www.bbc.com/news/blogs-trending-43218939) 

The pandemic of bots is not an easy problem to solve. Features such as identical or similar IPs, engagement around posts, usage patterns, and content similarity (many copy and paste) may give us some clues. In dealing with link spam, Yahoo! came up with TrustRank. Finding ways to combat bots is a complex research question in and of itself. We might choose to assume that there is already an ML system in place that is able to detect hashtags generated by bots. This way we would be consumers of this ML system.

We can have separate machine learning models for topic modeling, NSFW, and bot filtering. We can also combine multiple objectives and build a single model.


#### NSFW <a name="nsfw"></a>

Identifying NSFW content is not a trivial task. Words and phrases change meaning when used in specific contexts.

At the start, a dictionary may be sufficient to help filter NSFW hashtags. We can then expand on this by using RegEx and edit distances (need to be careful because short words might trigger high false positives). We can also implement a similar topic modeling component as above to identify synonyms.

A more advanced model may consider the context as well. Is this a context where the use of this hashtag is appropriate and funny? Or is this a context where this hashtag is meant to be offensive? We can think of this as a classification problem in NLP, although we’d need to obtain a large quantity of labeled data somehow, possibly through hand labeling (not free!).

How can we operationalize an NSFW classifier? Do we send all the posts and their associated hashtags to our NSFW predictor? Running every single post through a large fine-tuned NLP model with millions or billions of parameters in an online fashion costs time, compute resources, and money. While this could be useful, we can gain greater return on investment (specifically in the context of filtering NSFW content) by only using this for posts that use the top N trending hashtags. In other words, instead of preprocessing the hashtags to filter out NSFW content, we generate trending hashtags and post-process the hashtags before displaying.


### Attempt 3: Beyond MVP <a name="attempt-3-beyond-mvp"></a>

In Attempt 3, we lift the prior assumptions we have made and expand on Attempt 2. We have previously assumed that a single list of trending hashtags would be universally applicable. However, this is rarely the case. Trending topics in New Zealand may not be interesting to users in the US. Sports hashtags may not be interesting to people who are not into sports. Attempt 3 is when we begin to tie the trending hashtags feature back to the overall business objective. We want to have a trending hashtags feature that drives engagement by presenting new and interesting information to users.

Localization and personalization are a crucial component of user experience. This leads to a change in the machine learning task itself. Curating a list of trending hashtags for all users in a country is an unsupervised learning task. With personalization, this becomes a supervised learning task (the label being whether the user actually finds this hashtag interesting and relevant or clicks on the hashtag).

As the system grows in complexity, it’s important to use A/B testing to evaluate the utility of features. Does adding a component of localization actually increase engagement? We hypothesize that it should, but we will never know until we test it in a (small) population of users.


### Attempt 4: From Reactive to Proactive <a name="attempt-4-from-reactive-to-proactive"></a>

At the end of the day, we want to not just track trends, but predict trends. Being able to predict trending hashtags will allow the platform to better display appropriate content, scale and distribute resources, and create a better user experience overall. 

Instead of using frequencies or metadata counts, we can predict tags that will be trending using kurtosis (measure of tailedness/peakedness). 


## Reflections & Broader Impact <a name="reflections-and-broader-impact"></a>

Although the trending hashtags feature is only a small part of the platform, it’s no small feat. To actually build and implement a system like this, it makes sense to decouple objectives and “divide and conquer” whenever possible. It can mean to automate individual components one-at-a-time, especially since there is already a manual system in place.

Even if a simpler approach is not highly performant, we can use it to gain feedback on the end-to-end utility (such that we should be able to plug and play with future iterations) and even generate data required for more complex approaches.

Designing a machine learning system is an iterative process. We want to iterate over models, architectures, metrics, or any other design specification and evaluate results both offline and online.

In most real-world use cases, designing a machine learning system is not just designing a machine learning model. Before deploying a machine learning system, we have to consider the implications and consequences.

In the discussion of a trending hashtags solution, for example, we spent time talking about censorship and control over hashtags (or content in general), pandemic of bots, popularity bias, and other not-so-technical topics.

In 2016, Microsoft unveiled [Tay](https://en.wikipedia.org/wiki/Tay_(bot)): a chatbot named after the acronym “Thinking About You”. It was designed to be fun and engaging. Its predecessor, [Xiaoice](https://en.wikipedia.org/wiki/Xiaoice), which was launched in China in 2014, has attracted (and continues to attract) over 45 million followers, many of whom have been entertained and helped in some way. However, unlike Xiaoice, Tay was pulled less than 24 hours after its initial launch, as it quickly started posting inflammatory and offensive tweets.

Machine learning in the wild is unfortunately not nearly as “pretty” or predictable as it is in a controlled environment like a research lab (or with a controlled dataset). Designing a machine learning system takes much more than machine learning expertise; as machine learning engineers, we hope to remind our readers of that.


## References <a name="references"></a>

[Detecting Trends on Twitter](https://www.kth.se/social/files/58878811f276540810b9ee1a/SB%C3%A4ckstr%C3%B6m_JFHaslum.pdf)

[Characteristics of Similar-Context Trending Hashtags in Twitter: A Case Study](https://www.researchgate.net/publication/345190293_Characteristics_of_Similar-Context_Trending_Hashtags_in_Twitter_A_Case_Study)  
