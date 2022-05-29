import React from "react";
import * as classes from './style.module.css';

function Events() {
    return (
        <section>
            <div className={classes.Hero}>
                <h1 className={classes.Title}>Events</h1>
            </div>
            <p className={classes.Event}>
                Session 1 (Google’s intro to RecSys ) - 5 June @chloehe (Duration 1 hour. Up to 30min for questions and discussions)
            </p>
            <p className={classes.Event}>
                Session 2 (Wide and Deep Learning) - 12 June @Han @jinyun (Duration 1 hour)
            </p>
            <p className={classes.Event}>
                Session 2.5 (Sampling, Evaluation, and Systems) - 12 June @Goku Mohandas @ecdrid (Duration: 30 mins)
            </p>
        </section>
    );
}

export default Events;
